const STORAGE_KEY = 'studypal_checkpoints'

export interface Checkpoint {
  courseId: string
  chapterId: string
  sectionId: string
}

function loadCheckpoints(): Record<string, Checkpoint> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, Checkpoint>) : {}
  } catch {
    return {}
  }
}

function saveCheckpoints(checkpoints: Record<string, Checkpoint>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkpoints))
  } catch {
    // ignore storage errors
  }
}

export function getCheckpoint(courseId: string): Checkpoint | null {
  const checkpoints = loadCheckpoints()
  return checkpoints[courseId] ?? null
}

export function setCheckpoint(checkpoint: Checkpoint): void {
  const checkpoints = loadCheckpoints()
  checkpoints[checkpoint.courseId] = checkpoint
  saveCheckpoints(checkpoints)
}

export function clearCheckpoint(courseId: string): void {
  const checkpoints = loadCheckpoints()
  delete checkpoints[courseId]
  saveCheckpoints(checkpoints)
}
