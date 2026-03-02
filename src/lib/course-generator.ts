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

// ─── Concurrency helper ───────────────────────────────────────────────────────

async function withConcurrency<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let nextIdx = 0
  async function worker() {
    while (nextIdx < tasks.length) {
      const idx = nextIdx++
      results[idx] = await tasks[idx]()
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return results
}

const CONCURRENCY = 5

// ─── Main pipeline ────────────────────────────────────────────────────────────

export async function runGenerationPipeline(
  files: InputFile[],
  courseId: string,
  jobId: string,
): Promise<CourseContent> {

  // ─── STEP 1: OCR / text extraction (parallel) ────────────────────────────
  updateJob(jobId, {
    status: 'ocr',
    progress: 5,
    message: `Extracting text from ${files.length} file(s)...`,
  })

  let filesProcessed = 0
  const extracted = await Promise.all(
    files.map(async (file) => {
      const text = await extractTextFromFile(file)
      filesProcessed++
      updateJob(jobId, {
        progress: 5 + Math.round(10 * filesProcessed / files.length),
        message: `Processed ${filesProcessed}/${files.length} file(s)...`,
      })
      return { text, source: file.name }
    }),
  )

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

  // ─── STEP 6: Generate section content in parallel (RAG) ──────────────────
  updateJob(jobId, { status: 'content', progress: 50 })

  // Flatten all (chapter, section) pairs and pre-compute their query strings
  const flatSections = skeleton.chapters.flatMap((skCh) =>
    skCh.sections.map((skSec) => ({ skCh, skSec })),
  )

  // Batch-embed all section queries in a single API call
  const sectionQueryVecs = await embedTexts(
    flatSections.map(({ skCh, skSec }) => `${skCh.title}: ${skSec.title}`),
  )

  let sectionsDone = 0
  const sectionResults = await withConcurrency(
    flatSections.map(({ skCh, skSec }, idx) => async () => {
      const hits = await searchPoints(courseId, sectionQueryVecs[idx], 5)
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

      sectionsDone++
      updateJob(jobId, {
        progress: 50 + Math.round(30 * sectionsDone / totalSections),
        message: `Writing section content (${sectionsDone}/${totalSections})...`,
      })

      return { chapterId: skCh.id, sectionId: skSec.id, title: skSec.title, content }
    }),
    CONCURRENCY,
  )

  // Reconstruct chapter → sections structure in original order
  const sectionsByChapter = new Map<string, Section[]>()
  for (const skCh of skeleton.chapters) sectionsByChapter.set(skCh.id, [])
  for (const { chapterId, sectionId, title, content } of sectionResults) {
    sectionsByChapter.get(chapterId)!.push({ id: sectionId, title, content })
  }

  const chapters: Chapter[] = skeleton.chapters.map((skCh) => ({
    id: skCh.id,
    title: skCh.title,
    sections: sectionsByChapter.get(skCh.id)!,
  }))

  // ─── STEP 7: Generate exercises in parallel (RAG) ─────────────────────────
  updateJob(jobId, {
    status: 'exercises',
    progress: 82,
    message: 'Generating exercises...',
  })

  // Batch-embed all chapter titles for retrieval in one call
  const chapterQueryVecs = await embedTexts(skeleton.chapters.map((ch) => ch.title))

  // Pre-fetch RAG context per chapter (parallel)
  const chapterContexts = await Promise.all(
    skeleton.chapters.map(async (_skCh, i) => {
      const hits = await searchPoints(courseId, chapterQueryVecs[i], 8)
      return hits.map((h) => h.payload.text as string).join('\n\n---\n\n').slice(0, 3000)
    }),
  )

  // Flatten all exercises with their chapter context
  interface ExerciseTask {
    skCh: SkeletonChapter
    outline: SkeletonExercise
    context: string
    firstSection: Section
    globalIdx: number
  }
  let globalExIdx = 0
  const exerciseTasks: ExerciseTask[] = skeleton.chapters.flatMap((skCh, chIdx) => {
    const chapter = chapters.find((c) => c.id === skCh.id)!
    return skCh.exerciseOutlines.map((outline) => ({
      skCh,
      outline,
      context: chapterContexts[chIdx],
      firstSection: chapter.sections[0],
      globalIdx: globalExIdx++,
    }))
  })

  let exercisesDone = 0
  const exercises = await withConcurrency(
    exerciseTasks.map(({ skCh, outline, context, firstSection, globalIdx }) => async () => {
      const exId = `ex-${courseId}-${skCh.id}-${globalIdx}`

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

      exercisesDone++
      updateJob(jobId, {
        progress: 82 + Math.round(15 * exercisesDone / totalExercises),
        message: `Generating exercises (${exercisesDone}/${totalExercises})...`,
      })

      return {
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
      } satisfies Exercise
    }),
    CONCURRENCY,
  )

  updateJob(jobId, {
    status: 'done',
    progress: 100,
    message: 'Course generated successfully!',
  })

  return { courseId, chapters, exercises }
}
