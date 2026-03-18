import { kv } from "@vercel/kv";
import type { Chapter, Section, Exercise, CourseContent } from "#/data/courses";
import { chunkText } from "#/lib/chunker";
import { createCollection, upsertPoints, searchPoints } from "#/lib/qdrant";
import {
	extractTextFromFile,
	embedTexts,
	chatJSON,
	chatText,
	type InputFile,
} from "#/lib/mistral-ocr";
import { updateJob } from "#/lib/course-job-store";

// ─── Skeleton types ───────────────────────────────────────────────────────────

interface SkeletonSection {
	id: string;
	title: string;
}

interface SkeletonExercise {
	title: string;
	difficulty: "easy" | "medium" | "hard";
}

interface SkeletonChapter {
	id: string;
	title: string;
	sections: SkeletonSection[];
	exerciseOutlines: SkeletonExercise[];
}

interface CourseSkeleton {
	chapters: SkeletonChapter[];
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms: number) {
	return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async function up to `maxAttempts` times with exponential backoff.
 * Hard-fails immediately on auth/config errors (4xx) since retrying won't help.
 */
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
	let lastError: Error = new Error("Unknown error");
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (err) {
			lastError = err as Error;
			const msg = lastError.message;
			if (
				msg.includes("401") ||
				msg.includes("403") ||
				msg.includes("MISTRAL_API_KEY")
			)
				throw err;
			if (attempt < maxAttempts) {
				// 1.5 s → 3 s → 6 s
				await sleep(Math.pow(2, attempt - 1) * 1500);
			}
		}
	}
	throw lastError;
}

/**
 * Run `fn` over every item in `items` with at most `limit` tasks in flight at once.
 */
async function withConcurrency<T>(
	items: T[],
	fn: (item: T, index: number) => Promise<void>,
	limit: number
): Promise<void> {
	const queue = [...items.entries()];
	const workers = Array.from(
		{ length: Math.min(limit, items.length) },
		async () => {
			while (queue.length > 0) {
				const entry = queue.shift();
				if (entry) await fn(entry[1], entry[0]);
			}
		}
	);
	await Promise.all(workers);
}

// ─── Checkpoints (Vercel KV) ──────────────────────────────────────────────────

const CP_TTL = 86400; // 24 hours

async function saveCheckpoint(
	jobId: string,
	key: string,
	data: unknown
): Promise<void> {
	try {
		await kv.set(`cp:${jobId}:${key}`, JSON.stringify(data), {
			ex: CP_TTL,
		});
	} catch {
		// Non-fatal: a missed checkpoint just means we can't resume this step
	}
}

async function loadCheckpoint<T>(
	jobId: string,
	key: string
): Promise<T | null> {
	try {
		const raw = await kv.get<string>(`cp:${jobId}:${key}`);
		if (!raw) return null;
		return JSON.parse(raw as string) as T;
	} catch {
		return null;
	}
}

/** Remove all checkpoint keys for a finished (or aborted) job. */
export async function cleanupCheckpoints(jobId: string): Promise<void> {
	try {
		const keys = await kv.keys(`cp:${jobId}:*`);
		if (keys.length > 0) await Promise.all(keys.map((k) => kv.del(k)));
	} catch {
		// Non-fatal
	}
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

export async function runGenerationPipeline(
	files: InputFile[],
	courseId: string,
	jobId: string,
	resumeFromStep = 0
): Promise<CourseContent> {
	// ─── STEP 1: OCR / text extraction ───────────────────────────────────────
	let extracted: Array<{ text: string; source: string }>;

	if (resumeFromStep <= 1) {
		updateJob(jobId, {
			status: "ocr",
			progress: 5,
			message: `Extracting text from ${files.length} file(s) in parallel...`,
		});

		// All files processed concurrently — no more sequential OCR loop
		extracted = await withRetry(() =>
			Promise.all(
				files.map(async (file) => {
					const text = await extractTextFromFile(file);
					return { text, source: file.name };
				})
			)
		);

		await saveCheckpoint(jobId, "step1", extracted);
		updateJob(jobId, { progress: 15, lastSuccessfulStep: 1 });
	} else {
		updateJob(jobId, {
			status: "ocr",
			message: "Resuming from OCR checkpoint...",
		});
		const saved = await loadCheckpoint<
			Array<{ text: string; source: string }>
		>(jobId, "step1");
		if (!saved?.length)
			throw new Error("OCR checkpoint missing — please re-upload files");
		extracted = saved;
	}

	// ─── STEP 2: Chunk ────────────────────────────────────────────────────────
	// ─── STEP 3: Embed ────────────────────────────────────────────────────────
	let allChunks: ReturnType<typeof chunkText>;
	let allEmbeddings: number[][];

	if (resumeFromStep <= 3) {
		allChunks = extracted.flatMap(({ text, source }) =>
			chunkText(text, source)
		);
		updateJob(jobId, {
			status: "embedding",
			progress: 16,
			message: `Chunked into ${allChunks.length} segments. Generating embeddings...`,
		});

		// Single call — embedTexts() handles internal batching at 32
		allEmbeddings = await withRetry(() =>
			embedTexts(allChunks.map((c) => c.text))
		);

		await saveCheckpoint(jobId, "step3", {
			chunks: allChunks,
			embeddings: allEmbeddings,
		});
		updateJob(jobId, { progress: 30, lastSuccessfulStep: 3 });
	} else {
		updateJob(jobId, {
			status: "embedding",
			message: "Resuming from embedding checkpoint...",
		});
		const saved = await loadCheckpoint<{
			chunks: ReturnType<typeof chunkText>;
			embeddings: number[][];
		}>(jobId, "step3");
		if (!saved)
			throw new Error("Embedding checkpoint missing — please restart");
		allChunks = saved.chunks;
		allEmbeddings = saved.embeddings;
	}

	// ─── STEP 4: Store in Qdrant ──────────────────────────────────────────────
	if (resumeFromStep <= 4) {
		updateJob(jobId, {
			message: "Storing vectors in knowledge base...",
			progress: 32,
		});
		await withRetry(() => createCollection(courseId));

		const UPSERT_BATCH = 100;
		for (let i = 0; i < allChunks.length; i += UPSERT_BATCH) {
			const batch = allChunks.slice(i, i + UPSERT_BATCH);
			await withRetry(() =>
				upsertPoints(
					courseId,
					batch.map((chunk, j) => ({
						id: i + j,
						vector: allEmbeddings[i + j],
						payload: {
							text: chunk.text,
							source: chunk.source,
							index: chunk.index,
						},
					}))
				)
			);
		}
		updateJob(jobId, { progress: 42, lastSuccessfulStep: 4 });
	}

	// ─── STEP 5: Generate skeleton ────────────────────────────────────────────
	let skeleton: CourseSkeleton;

	if (resumeFromStep <= 5) {
		updateJob(jobId, {
			status: "skeleton",
			progress: 44,
			message: "Analysing material and building course structure...",
		});

		const overviewText = extracted
			.map((e) => e.text)
			.join("\n\n---\n\n")
			.slice(0, 10000);

		const skeletonRaw = await withRetry(() =>
			chatJSON(
				`You are a university curriculum designer. Analyse the provided material and create a COMPLETE course outline that covers the ENTIRE curriculum — leave no topic out.
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
- Create as many chapters as the material requires — do NOT cap at any number. Every major topic deserves its own chapter.
- Create as many sections per chapter as needed to cover all subtopics — every concept, definition, theorem, or technique deserves its own section.
- Chapter IDs: ch1, ch2 … chN. Section IDs: sec1-1, sec1-2, sec2-1 …
- 5 to 8 exercise outlines per chapter. Each outline MUST test a DIFFERENT exercise idea / skill:
  • direct computation or numerical application
  • conceptual understanding or true/false with justification
  • proof or step-by-step derivation
  • real-world modelling or word problem
  • edge-case / boundary / special-case analysis
  • multi-step problem integrating several concepts
  • comparison, classification, or counterexample task
  • error-finding — identify and correct a faulty solution
- Mix difficulties: at least one easy, one medium, one hard per chapter.
- All titles must be specific and academic. No generic names like "Exercise 1" or "Practice Problem".`,
				`Course material:\n\n${overviewText}`
			)
		);

		skeleton = JSON.parse(skeletonRaw);
		await saveCheckpoint(jobId, "step5", skeleton);
		updateJob(jobId, { progress: 48, lastSuccessfulStep: 5 });
	} else {
		updateJob(jobId, {
			status: "skeleton",
			message: "Resuming from skeleton checkpoint...",
		});
		const saved = await loadCheckpoint<CourseSkeleton>(jobId, "step5");
		if (!saved)
			throw new Error("Skeleton checkpoint missing — cannot resume");
		skeleton = saved;
	}

	const totalSections = skeleton.chapters.reduce(
		(s, c) => s + c.sections.length,
		0
	);
	const totalExercises = skeleton.chapters.reduce(
		(s, c) => s + c.exerciseOutlines.length,
		0
	);

	updateJob(jobId, {
		progress: 48,
		message: `Structure ready: ${skeleton.chapters.length} chapters · ${totalSections} sections · ${totalExercises} exercises. Writing content...`,
	});

	// ─── STEP 6: Generate section content (parallel RAG) ─────────────────────
	updateJob(jobId, { status: "content", progress: 50 });

	// Load any already-completed sections from a previous (interrupted) run
	const savedSections =
		(await loadCheckpoint<Record<string, string>>(jobId, "step6")) ?? {};
	const sectionContents: Record<string, string> = { ...savedSections };
	let sectionsDone = Object.keys(savedSections).length;

	// Only process sections that haven't been written yet
	const pendingSections = skeleton.chapters.flatMap((skCh) =>
		skCh.sections
			.filter((skSec) => !sectionContents[skSec.id])
			.map((skSec) => ({ skCh, skSec }))
	);

	if (pendingSections.length > 0) {
		// Batch-embed ALL pending section queries in a single API call
		const sectionQueryVecs = await withRetry(() =>
			embedTexts(
				pendingSections.map(
					({ skCh, skSec }) => `${skCh.title}: ${skSec.title}`
				)
			)
		);

		// Generate content for up to 6 sections in parallel
		await withConcurrency(
			pendingSections,
			async ({ skCh, skSec }, i) => {
				const hits = await withRetry(() =>
					searchPoints(courseId, sectionQueryVecs[i], 5)
				);
				const context = hits
					.map((h) => h.payload.text as string)
					.join("\n\n---\n\n");

				const content = await withRetry(() =>
					chatText(
						`You are an expert professor writing educational content for a university course.
Write the body of section "${skSec.title}" in chapter "${skCh.title}".
Requirements:
- Use markdown: **bold** for key terms, bullet lists where helpful
- Use LaTeX for maths: $inline$ and $$block$$ (use \\\\cmd for LaTeX commands inside $$)
- Be precise, concise, and educational — 200 to 400 words
- Do NOT include a heading; output only the section body`,
						`Relevant material:\n\n${context}\n\nWrite the section body for: "${skSec.title}"`
					)
				);

				sectionContents[skSec.id] = content;
				sectionsDone++;

				// Persist progress after every completed section — enables mid-step resume
				await saveCheckpoint(jobId, "step6", sectionContents);
				updateJob(jobId, {
					progress:
						50 + Math.round((30 * sectionsDone) / totalSections),
					message: `Writing section content (${sectionsDone}/${totalSections})...`,
					lastSuccessfulStep: 6,
				});
			},
			6
		);
	}

	// Assemble chapters from completed content map
	const chapters: Chapter[] = skeleton.chapters.map((skCh) => ({
		id: skCh.id,
		title: skCh.title,
		sections: skCh.sections.map(
			(skSec): Section => ({
				id: skSec.id,
				title: skSec.title,
				content: sectionContents[skSec.id] ?? "",
			})
		),
	}));

	// ─── STEP 7: Generate exercises (parallel RAG) ────────────────────────────
	updateJob(jobId, {
		status: "exercises",
		progress: 82,
		message: "Generating exercises...",
	});

	// Load any already-completed exercises from a previous (interrupted) run
	const savedExercises =
		(await loadCheckpoint<Exercise[]>(jobId, "step7")) ?? [];
	const exercises: Exercise[] = [...savedExercises];
	const doneExerciseIds = new Set(savedExercises.map((e) => e.id));
	let exercisesDone = savedExercises.length;

	// Build the full list of (chapter, outline, id) items, skip already done
	let exerciseIndex = 0;
	const pendingExercises = skeleton.chapters
		.flatMap((skCh) =>
			skCh.exerciseOutlines.map((outline) => {
				const exId = `ex-${courseId}-${skCh.id}-${exerciseIndex++}`;
				return { skCh, outline, exId };
			})
		)
		.filter(({ exId }) => !doneExerciseIds.has(exId));

	if (pendingExercises.length > 0) {
		// Batch-embed all unique chapter titles in one API call, then pre-fetch RAG context
		const uniqueChapterIds = [
			...new Set(pendingExercises.map((e) => e.skCh.id)),
		];
		const chapterVecs = await withRetry(() =>
			embedTexts(
				uniqueChapterIds.map(
					(id) => skeleton.chapters.find((c) => c.id === id)!.title
				)
			)
		);
		const chapterVecMap: Record<string, number[]> = {};
		uniqueChapterIds.forEach((id, i) => {
			chapterVecMap[id] = chapterVecs[i];
		});

		// One RAG lookup per chapter (not per exercise)
		const chapterContextMap: Record<string, string> = {};
		await Promise.all(
			uniqueChapterIds.map(async (id) => {
				const hits = await withRetry(() =>
					searchPoints(courseId, chapterVecMap[id], 8)
				);
				chapterContextMap[id] = hits
					.map((h) => h.payload.text as string)
					.join("\n\n---\n\n")
					.slice(0, 3000);
			})
		);

		// Generate up to 4 exercises in parallel
		await withConcurrency(
			pendingExercises,
			async ({ skCh, outline, exId }) => {
				const chapter = chapters.find((c) => c.id === skCh.id)!;
				const firstSection = chapter.sections[0];
				const context = chapterContextMap[skCh.id];

				const raw = await withRetry(() =>
					chatJSON(
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
						`Context:\n\n${context}\n\nCreate exercise: "${outline.title}"`
					)
				);

				const parsed = JSON.parse(raw) as {
					problem: string;
					steps: string[];
				};

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
				});

				exercisesDone++;

				// Persist progress after every completed exercise
				await saveCheckpoint(jobId, "step7", exercises);
				updateJob(jobId, {
					progress:
						82 + Math.round((15 * exercisesDone) / totalExercises),
					message: `Generating exercises (${exercisesDone}/${totalExercises})...`,
					lastSuccessfulStep: 7,
				});
			},
			4
		);
	}

	updateJob(jobId, {
		status: "done",
		progress: 100,
		message: "Course generated successfully!",
	});

	return { courseId, chapters, exercises };
}

// ─── On-demand exercise generation ───────────────────────────────────────────

export interface GenerateMoreExercisesOptions {
	/** How many new exercises to produce (default 5). */
	count?: number;
	/** If set, only generate for this chapter. Otherwise spread across all chapters. */
	targetChapterId?: string;
}

/**
 * Generate additional exercises for an already-built course, deliberately
 * avoiding the exercise ideas already present so every new batch is fresh.
 */
export async function generateMoreExercises(
	courseId: string,
	chapters: Chapter[],
	existingExercises: Exercise[],
	options: GenerateMoreExercisesOptions = {}
): Promise<Exercise[]> {
	const { count = 5, targetChapterId } = options;

	const targetChapters = targetChapterId
		? chapters.filter((c) => c.id === targetChapterId)
		: chapters;

	if (targetChapters.length === 0) return [];

	// Build a list of already-used exercise ideas so we never repeat them
	const usedTitles = existingExercises
		.filter((e) => !targetChapterId || e.chapterId === targetChapterId)
		.map((e) => `- ${e.title}`)
		.join("\n");

	// Fetch RAG context for each target chapter (batch embed + parallel search)
	const chapterVecs = await withRetry(() =>
		embedTexts(targetChapters.map((c) => c.title))
	);
	const chapterContextMap: Record<string, string> = {};
	await Promise.all(
		targetChapters.map(async (ch, i) => {
			const hits = await withRetry(() =>
				searchPoints(courseId, chapterVecs[i], 8)
			);
			chapterContextMap[ch.id] = hits
				.map((h) => h.payload.text as string)
				.join("\n\n---\n\n")
				.slice(0, 3000);
		})
	);

	// Decide how many exercises per chapter
	const perChapter = Math.ceil(count / targetChapters.length);

	// Ask the LLM to produce `perChapter` NEW outlines per chapter, then generate them
	const newExercises: Exercise[] = [];
	const baseIndex = existingExercises.length;

	await withConcurrency(
		targetChapters,
		async (ch, chIdx) => {
			const context = chapterContextMap[ch.id];
			const firstSection = ch.sections[0];

			// Get new outlines from the LLM
			const outlinesRaw = await withRetry(() =>
				chatJSON(
					`You are a university professor creating NEW practice exercises.
Generate exactly ${perChapter} exercise outlines for the chapter "${ch.title}".
Each exercise MUST test a DIFFERENT core skill from this list (rotate through them):
  • direct computation or numerical application
  • conceptual understanding or true/false with justification
  • proof or step-by-step derivation
  • real-world modelling or word problem
  • edge-case / boundary / special-case analysis
  • multi-step problem integrating several concepts
  • comparison, classification, or counterexample task
  • error-finding — identify and correct a faulty solution

ALREADY EXISTING exercises (DO NOT repeat these ideas):
${usedTitles || "(none yet)"}

Output ONLY valid JSON:
{
  "outlines": [
    { "title": "Specific Academic Title", "difficulty": "easy" }
  ]
}
Rules:
- Exactly ${perChapter} outlines
- All titles specific and academic, no generic names
- Mix difficulties: easy / medium / hard`,
					`Chapter context:\n\n${context}`
				)
			);

			const { outlines } = JSON.parse(outlinesRaw) as {
				outlines: SkeletonExercise[];
			};

			// Generate each exercise in full, 4 at a time
			await withConcurrency(
				outlines,
				async (outline, oIdx) => {
					const exId = `ex-${courseId}-${ch.id}-more-${baseIndex + chIdx * perChapter + oIdx}`;

					const raw = await withRetry(() =>
						chatJSON(
							`You are a university professor creating a student exercise.
Create a ${outline.difficulty} exercise titled "${outline.title}" for the chapter "${ch.title}".
Output ONLY valid JSON:
{
  "problem": "problem statement in markdown; use $…$ for inline LaTeX and $$…$$ for block LaTeX",
  "steps": [
    "Step 1: …",
    "Final Answer: …"
  ]
}
Rules:
- problem: clear statement with all given data; LaTeX for all maths
- steps: 3 to 6 entries, last must start with "Final Answer:"
- use LaTeX where appropriate`,
							`Context:\n\n${context}\n\nCreate exercise: "${outline.title}"`
						)
					);

					const parsed = JSON.parse(raw) as {
						problem: string;
						steps: string[];
					};

					newExercises.push({
						id: exId,
						courseId,
						chapterId: ch.id,
						title: outline.title,
						difficulty: outline.difficulty,
						prerequisites: firstSection
							? [
									{
										sectionId: firstSection.id,
										chapterId: ch.id,
										label: firstSection.title,
									},
								]
							: [],
						problem: parsed.problem,
						steps: parsed.steps,
						solved: false,
					});
				},
				4
			);
		},
		3
	);

	return newExercises;
}
