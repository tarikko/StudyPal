export interface GenerationJob {
  jobId: string
  courseId: string
  status: 'pending' | 'ocr' | 'embedding' | 'skeleton' | 'content' | 'exercises' | 'done' | 'error'
  progress: number // 0–100
  message: string
  error?: string
}

const jobs = new Map<string, GenerationJob>()

export function createJob(jobId: string, courseId: string): GenerationJob {
  const job: GenerationJob = {
    jobId,
    courseId,
    status: 'pending',
    progress: 0,
    message: 'Starting...',
  }
  jobs.set(jobId, job)
  return job
}

export function updateJob(jobId: string, updates: Partial<GenerationJob>) {
  const job = jobs.get(jobId)
  if (job) {
    jobs.set(jobId, { ...job, ...updates })
  }
}

export function getJob(jobId: string): GenerationJob | undefined {
  return jobs.get(jobId)
}
