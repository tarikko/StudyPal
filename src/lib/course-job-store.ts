import { kv } from '@vercel/kv'

export interface GenerationJob {
  jobId: string
  courseId: string
  courseName?: string
  status: 'pending' | 'ocr' | 'embedding' | 'skeleton' | 'content' | 'exercises' | 'done' | 'error'
  progress: number // 0–100
  message: string
  error?: string
  createdAt: number
}

const JOB_PREFIX = 'job:'
const JOB_TTL = 24 * 60 * 60 // 24 hours

const jobs = new Map<string, GenerationJob>()

export function createJob(jobId: string, courseId: string, courseName?: string): GenerationJob {
  const job: GenerationJob = {
    jobId,
    courseId,
    courseName,
    status: 'pending',
    progress: 0,
    message: 'Starting...',
    createdAt: Date.now(),
  }
  jobs.set(jobId, job)
  return job
}

export function updateJob(jobId: string, updates: Partial<GenerationJob>) {
  const job = jobs.get(jobId)
  if (job) {
    const updated = { ...job, ...updates }
    jobs.set(jobId, updated)
    // Persist terminal states to Vercel KV for cross-session visibility
    if (updates.status === 'done' || updates.status === 'error') {
      void kv.set(`${JOB_PREFIX}${jobId}`, updated, { ex: JOB_TTL }).catch(() => {})
    }
  }
}

export function getJob(jobId: string): GenerationJob | undefined {
  return jobs.get(jobId)
}

export function getAllJobs(): GenerationJob[] {
  return Array.from(jobs.values()).sort((a, b) => b.createdAt - a.createdAt)
}

export async function persistJobToKV(job: GenerationJob): Promise<void> {
  await kv.set(`${JOB_PREFIX}${job.jobId}`, job, { ex: JOB_TTL })
}

export async function getAllJobsWithKV(): Promise<GenerationJob[]> {
  const inMemory = getAllJobs()
  try {
    const keys = await kv.keys(`${JOB_PREFIX}*`)
    if (!keys.length) return inMemory
    const kvJobs = (await Promise.all(keys.map((k) => kv.get<GenerationJob>(k))))
      .filter((j): j is GenerationJob => j !== null)
    const inMemoryIds = new Set(inMemory.map((j) => j.jobId))
    const kvOnly = kvJobs.filter((j) => !inMemoryIds.has(j.jobId))
    return [...inMemory, ...kvOnly].sort((a, b) => b.createdAt - a.createdAt)
  } catch {
    return inMemory
  }
}
