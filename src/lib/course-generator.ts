import type { Chapter, Section, Exercise, CourseContent } from '#/data/courses'
import { chunkText } from '#/lib/chunker'
import { createCollection, upsertPoints, searchPoints } from '#/lib/qdrant'
import { extractTextFromFile, embedTexts, chatJSON, chatText, type InputFile } from '#/lib/mistral-ocr'
import { updateJob } from '#/lib/course-job-store'

// ─── Skeleton types ───────────────────────────────────────────────────────────

interface SkeletonSection {
  id: string
  title: string
}

interface SkeletonExercise {
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface SkeletonChapter {
  id: string
  title: string
  sections: SkeletonSection[]
  exerciseOutlines: SkeletonExercise[]
}

interface CourseSkeleton {
  chapters: SkeletonChapter[]
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

export async function runGenerationPipeline(
  files: InputFile[],
  courseId: string,
  jobId: string,
): Promise<CourseContent> {

  // ─── STEP 1: OCR / text extraction ───────────────────────────────────────
  updateJob(jobId, {
    status: 'ocr',
    progress: 5,
    message: `Extracting text from ${files.length} file(s)...`,
  })

  const extracted: Array<{ text: string; source: string }> = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    updateJob(jobId, { message: `Processing "${file.name}" (${i + 1}/${files.length})...` })
    const text = await extractTextFromFile(file)
    extracted.push({ text, source: file.name })
    updateJob(jobId, { progress: 5 + Math.round(10 * (i + 1) / files.length) })
  }

  // ─── STEP 2: Chunk ────────────────────────────────────────────────────────
  const allChunks = extracted.flatMap(({ text, source }) => chunkText(text, source))
  updateJob(jobId, {
    status: 'embedding',
    progress: 16,
    message: `Chunked into ${allChunks.length} segments. Generating embeddings...`,
  })

  // ─── STEP 3: Embed in batches ─────────────────────────────────────────────
  const EMBED_BATCH = 16
  const allEmbeddings: number[][] = []
  for (let i = 0; i < allChunks.length; i += EMBED_BATCH) {
    const batch = allChunks.slice(i, i + EMBED_BATCH)
    const vecs = await embedTexts(batch.map((c) => c.text))
    allEmbeddings.push(...vecs)
    updateJob(jobId, {
      progress: 16 + Math.round(14 * Math.min(i + EMBED_BATCH, allChunks.length) / allChunks.length),
    })
  }

  // ─── STEP 4: Store in Qdrant ──────────────────────────────────────────────
  updateJob(jobId, { message: 'Storing vectors in knowledge base...', progress: 32 })
  await createCollection(courseId)

  const UPSERT_BATCH = 100
  for (let i = 0; i < allChunks.length; i += UPSERT_BATCH) {
    const batch = allChunks.slice(i, i + UPSERT_BATCH)
    await upsertPoints(
      courseId,
      batch.map((chunk, j) => ({
        id: i + j,
        vector: allEmbeddings[i + j],
        payload: { text: chunk.text, source: chunk.source, index: chunk.index },
      })),
    )
  }
  updateJob(jobId, { progress: 42 })

  // ─── STEP 5: Generate skeleton ────────────────────────────────────────────
  updateJob(jobId, {
    status: 'skeleton',
    progress: 44,
    message: 'Analysing material and building course structure...',
  })

  // Give the LLM an overview of the full material (first ~10 000 chars)
  const overviewText = extracted.map((e) => e.text).join('\n\n---\n\n').slice(0, 10000)

  const skeletonRaw = await chatJSON(
    `You are a university curriculum designer. Create a structured course outline from the provided material.
Output ONLY valid JSON with this exact shape:
{
  "chapters": [
    {
      "id": "ch1",
      "title": "Chapter Title",
      "sections": [
        { "id": "sec1-1", "title": "Section Title" }
      ],
      "exerciseOutlines": [
        { "title": "Exercise Title", "difficulty": "easy" }
      ]
    }
  ]
}
Rules:
- 3 to 5 chapters
- 2 to 4 sections per chapter, IDs like sec1-1, sec1-2, sec2-1 …
- 2 to 3 exercise outlines per chapter; mix difficulties (easy/medium/hard)
- keep chapter IDs short: ch1, ch2 … chN
- titles must be specific and academic`,
    `Course material:\n\n${overviewText}`,
  )

  const skeleton: CourseSkeleton = JSON.parse(skeletonRaw)
  const totalSections = skeleton.chapters.reduce((s, c) => s + c.sections.length, 0)
  const totalExercises = skeleton.chapters.reduce((s, c) => s + c.exerciseOutlines.length, 0)

  updateJob(jobId, {
    progress: 48,
    message: `Structure ready: ${skeleton.chapters.length} chapters · ${totalSections} sections · ${totalExercises} exercises. Writing content...`,
  })

  // ─── STEP 6: Generate section content (RAG) ───────────────────────────────
  updateJob(jobId, { status: 'content', progress: 50 })

  const chapters: Chapter[] = []
  let sectionsDone = 0

  for (const skCh of skeleton.chapters) {
    const sections: Section[] = []

    for (const skSec of skCh.sections) {
      // Retrieve the most relevant chunks for this section
      const [queryVec] = await embedTexts([`${skCh.title}: ${skSec.title}`])
      const hits = await searchPoints(courseId, queryVec, 5)
      const context = hits.map((h) => h.payload.text as string).join('\n\n---\n\n')

      const content = await chatText(
        `You are an expert professor writing educational content for a university course.
Write the body of section "${skSec.title}" in chapter "${skCh.title}".
Requirements:
- Use markdown: **bold** for key terms, bullet lists where helpful
- Use LaTeX for maths: $inline$ and $$block$$ (use \\\\cmd for LaTeX commands inside $$)
- Be precise, concise, and educational — 200 to 400 words
- Do NOT include a heading; output only the section body`,
        `Relevant material:\n\n${context}\n\nWrite the section body for: "${skSec.title}"`,
      )

      sections.push({ id: skSec.id, title: skSec.title, content })
      sectionsDone++
      updateJob(jobId, {
        progress: 50 + Math.round(30 * sectionsDone / totalSections),
        message: `Writing section content (${sectionsDone}/${totalSections})...`,
      })
    }

    chapters.push({ id: skCh.id, title: skCh.title, sections })
  }

  // ─── STEP 7: Generate exercises (RAG) ─────────────────────────────────────
  updateJob(jobId, {
    status: 'exercises',
    progress: 82,
    message: 'Generating exercises...',
  })

  const exercises: Exercise[] = []
  let exercisesDone = 0

  for (const skCh of skeleton.chapters) {
    const chapter = chapters.find((c) => c.id === skCh.id)!
    const firstSection = chapter.sections[0]

    // Retrieve broad context for the whole chapter
    const [chapterVec] = await embedTexts([skCh.title])
    const hits = await searchPoints(courseId, chapterVec, 8)
    const context = hits.map((h) => h.payload.text as string).join('\n\n---\n\n').slice(0, 3000)

    for (const outline of skCh.exerciseOutlines) {
      const exId = `ex-${courseId}-${skCh.id}-${exercisesDone}`

      const raw = await chatJSON(
        `You are a university professor creating a student exercise.
Create a ${outline.difficulty} exercise titled "${outline.title}" for the chapter "${skCh.title}".
Output ONLY valid JSON:
{
  "problem": "problem statement in markdown; use $…$ for inline LaTeX and $$…$$ for block LaTeX",
  "steps": [
    "Step 1: …",
    "Step 2: …",
    "Final Answer: …"
  ]
}
Rules:
- problem: clear statement with all given data; use LaTeX for any maths
- steps: 3 to 6 entries progressing towards the answer; last entry must start with "Final Answer:"
- use LaTeX in steps where appropriate`,
        `Context:\n\n${context}\n\nCreate exercise: "${outline.title}"`,
      )

      const parsed = JSON.parse(raw) as { problem: string; steps: string[] }

      exercises.push({
        id: exId,
        courseId,
        chapterId: skCh.id,
        title: outline.title,
        difficulty: outline.difficulty,
        prerequisites: [
          {
            sectionId: firstSection.id,
            chapterId: skCh.id,
            label: firstSection.title,
          },
        ],
        problem: parsed.problem,
        steps: parsed.steps,
        solved: false,
      })

      exercisesDone++
      updateJob(jobId, {
        progress: 82 + Math.round(15 * exercisesDone / totalExercises),
        message: `Generating exercises (${exercisesDone}/${totalExercises})...`,
      })
    }
  }

  updateJob(jobId, {
    status: 'done',
    progress: 100,
    message: 'Course generated successfully!',
  })

  return { courseId, chapters, exercises }
}
