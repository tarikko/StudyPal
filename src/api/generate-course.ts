import { createServerFn } from "@tanstack/react-start";
import { createOwnedJob, updateJob, getJob } from "#/lib/course-job-store";
import {
	runGenerationPipeline,
	cleanupCheckpoints,
} from "#/lib/course-generator";
import { saveGeneratedCourse } from "#/lib/generated-course-store";
import { requireViewerUserId, getViewerUserId } from "#/lib/auth-server";
import type { InputFile } from "#/lib/mistral-ocr";
import type { Course } from "#/data/timetable";

export interface StartGenerationInput {
	files: InputFile[];
	courseMeta: Course & { description: string };
}

export interface RetryGenerationInput {
	jobId: string;
	files: InputFile[];
	courseMeta: Course & { description: string };
}

/** Kick off a brand-new generation job. Returns immediately with {jobId, courseId}. */
export const startGeneration = createServerFn({ method: "POST" })
	.inputValidator((input: StartGenerationInput) => input)
	.handler(async ({ data }) => {
		const jobId = crypto.randomUUID();
		const courseId = data.courseMeta.id;
		const ownerUserId = await requireViewerUserId();
		createOwnedJob(jobId, courseId, ownerUserId, data.courseMeta.name);

		// Fire-and-forget: response returns immediately while pipeline runs
		void runGenerationPipeline(data.files, courseId, jobId)
			.then(async (content) => {
				await saveGeneratedCourse({
					meta: data.courseMeta,
					content,
					ownerUserId,
				});
				await cleanupCheckpoints(jobId);
			})
			.catch((err: Error) => {
				updateJob(jobId, {
					status: "error",
					message: `Generation failed: ${err.message}`,
					error: err.message,
					canRetry: true,
				});
			});

		return { jobId, courseId };
	});

/**
 * Resume a previously failed job from its last successful checkpoint.
 * The client should call this when it sees `job.canRetry === true`.
 */
export const retryGeneration = createServerFn({ method: "POST" })
	.inputValidator((input: RetryGenerationInput) => input)
	.handler(async ({ data }) => {
		const { jobId, files, courseMeta } = data;
		const viewerUserId = await getViewerUserId();
		const job = await getJob(jobId, viewerUserId);
		if (!job) throw new Error(`Job ${jobId} not found`);

		const resumeFromStep = (job.lastSuccessfulStep ?? 0) + 1;

		updateJob(jobId, {
			status: "pending",
			message: `Retrying from step ${resumeFromStep}...`,
			canRetry: false,
			error: undefined,
		});

		void runGenerationPipeline(files, courseMeta.id, jobId, resumeFromStep)
			.then(async (content) => {
				await saveGeneratedCourse({
					meta: courseMeta,
					content,
					ownerUserId: job.ownerUserId ?? viewerUserId,
				});
				await cleanupCheckpoints(jobId);
			})
			.catch((err: Error) => {
				updateJob(jobId, {
					status: "error",
					message: `Retry failed: ${err.message}`,
					error: err.message,
					canRetry: true,
				});
			});

		return { jobId, resumedFromStep: resumeFromStep };
	});
