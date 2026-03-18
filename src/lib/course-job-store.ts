import { kv } from "@vercel/kv";

export interface GenerationJob {
	jobId: string;
	courseId: string;
	courseName?: string;
	createdAt: number;
	ownerUserId?: string | null;
	status:
		| "pending"
		| "ocr"
		| "embedding"
		| "skeleton"
		| "content"
		| "exercises"
		| "done"
		| "error";
	progress: number; // 0–100
	message: string;
	error?: string;
	/** Last pipeline step (1–7) that completed successfully. Used to resume after a failure. */
	lastSuccessfulStep?: number;
	/** True when the job errored but has a valid checkpoint to resume from. */
	canRetry?: boolean;
}

const JOB_TTL = 86400; // 24 hours
const JOB_PREFIX = "job:";

// In-process cache — instant reads within the same serverless invocation
const jobs = new Map<string, GenerationJob>();

export function createJob(
	jobId: string,
	courseId: string,
	courseName?: string
): GenerationJob {
	const job: GenerationJob = {
		jobId,
		courseId,
		courseName,
		createdAt: Date.now(),
		ownerUserId: null,
		status: "pending",
		progress: 0,
		message: "Starting...",
	};
	jobs.set(jobId, job);
	// Persist to KV so polling requests on other instances can read it
	void kv.set(`${JOB_PREFIX}${jobId}`, job, { ex: JOB_TTL }).catch(() => {
		/* non-fatal */
	});
	return job;
}

export function createOwnedJob(
	jobId: string,
	courseId: string,
	ownerUserId: string | null,
	courseName?: string
): GenerationJob {
	const job: GenerationJob = {
		jobId,
		courseId,
		courseName,
		createdAt: Date.now(),
		ownerUserId,
		status: "pending",
		progress: 0,
		message: "Starting...",
	};
	jobs.set(jobId, job);
	void kv.set(`${JOB_PREFIX}${jobId}`, job, { ex: JOB_TTL }).catch(() => {
		/* non-fatal */
	});
	return job;
}

export function updateJob(jobId: string, updates: Partial<GenerationJob>) {
	const job = jobs.get(jobId);
	if (!job) return;
	const updated = { ...job, ...updates };
	jobs.set(jobId, updated);
	// Fire-and-forget KV write — keeps cross-instance polling accurate
	void kv.set(`${JOB_PREFIX}${jobId}`, updated, { ex: JOB_TTL }).catch(() => {
		/* non-fatal */
	});
}

export async function getJob(
	jobId: string,
	viewerUserId?: string | null
): Promise<GenerationJob | undefined> {
	// Fast path: same process already has it
	const cached = jobs.get(jobId);
	if (cached) {
		if (
			cached.ownerUserId &&
			cached.ownerUserId !== (viewerUserId ?? null)
		) {
			return undefined;
		}
		return cached;
	}

	// Fallback: another serverless instance wrote it to KV
	try {
		const remote = await kv.get<GenerationJob>(`${JOB_PREFIX}${jobId}`);
		if (remote) {
			if (
				remote.ownerUserId &&
				remote.ownerUserId !== (viewerUserId ?? null)
			) {
				return undefined;
			}
			jobs.set(jobId, remote); // warm the local cache
			return remote;
		}
	} catch {
		// Non-fatal: return undefined if KV is unreachable
	}
	return undefined;
}

export function getAllJobs(): GenerationJob[] {
	return Array.from(jobs.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export async function persistJobToKV(job: GenerationJob): Promise<void> {
	await kv.set(`${JOB_PREFIX}${job.jobId}`, job, { ex: JOB_TTL });
}

export async function getAllJobsWithKV(): Promise<GenerationJob[]> {
	const inMemory = getAllJobs();
  try {
		const keys = await kv.keys(`${JOB_PREFIX}*`);
		if (!keys.length) return inMemory;
    const kvJobs = (await Promise.all(keys.map((k) => kv.get<GenerationJob>(k))))
			.filter((j): j is GenerationJob => j !== null);
		const inMemoryIds = new Set(inMemory.map((j) => j.jobId));
		const kvOnly = kvJobs.filter((j) => !inMemoryIds.has(j.jobId));
		return [...inMemory, ...kvOnly].sort((a, b) => b.createdAt - a.createdAt);
  } catch {
		return inMemory;
  }
}
