import { createServerFn } from "@tanstack/react-start";
import { getAllJobsWithKV, type GenerationJob } from "#/lib/course-job-store";

export const getAllGenerationJobs = createServerFn({ method: "POST" })
	.handler(async (): Promise<GenerationJob[]> => {
		return getAllJobsWithKV();
	});
