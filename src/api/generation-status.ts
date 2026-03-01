import { createServerFn } from "@tanstack/react-start";
import { getJob, type GenerationJob } from "#/lib/course-job-store";

export const getGenerationStatus = createServerFn({ method: "POST" })
	.inputValidator((input: { jobId: string }) => input)
	.handler(async ({ data }): Promise<GenerationJob | null> => {
		return getJob(data.jobId) ?? null;
	});
