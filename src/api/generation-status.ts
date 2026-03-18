import { createServerFn } from "@tanstack/react-start";
import { getJob, type GenerationJob } from "#/lib/course-job-store";
import { getViewerUserId } from "#/lib/auth-server";

export const getGenerationStatus = createServerFn({ method: "POST" })
	.inputValidator((input: { jobId: string }) => input)
	.handler(async ({ data }): Promise<GenerationJob | null> => {
		const viewerUserId = await getViewerUserId();
		return (await getJob(data.jobId, viewerUserId)) ?? null;
	});
