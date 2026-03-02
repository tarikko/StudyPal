import { createServerFn } from "@tanstack/react-start";
import { createJob, updateJob, persistJobToKV } from "#/lib/course-job-store";
import { runGenerationPipeline } from "#/lib/course-generator";
import { saveGeneratedCourse } from "#/lib/generated-course-store";
import type { InputFile } from "#/lib/mistral-ocr";
import type { Course } from "#/data/timetable";

export interface StartGenerationInput {
	files: InputFile[];
	courseMeta: Course & { description: string };
}

export const startGeneration = createServerFn({ method: "POST" })
	.inputValidator((input: StartGenerationInput) => input)
	.handler(async ({ data }) => {
		const jobId = crypto.randomUUID();
		const courseId = data.courseMeta.id;

		const job = createJob(jobId, courseId, data.courseMeta.name);

		// Persist initial job state to Vercel KV so the "all jobs" panel
		// can display it even before the pipeline emits any updates
		await persistJobToKV(job).catch(() => {});

		// Fire-and-forget: do not await so the response returns immediately
		void runGenerationPipeline(data.files, courseId, jobId)
			.then(async (content) => {
				await saveGeneratedCourse({ meta: data.courseMeta, content });
			})
			.catch((err: Error) => {
				updateJob(jobId, {
					status: "error",
					message: `Generation failed: ${err.message}`,
					error: err.message,
				});
			});

		return { jobId, courseId };
	});
