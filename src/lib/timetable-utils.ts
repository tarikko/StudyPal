import { timetable, courses, dayNames } from '../data/timetable'
import type { TimetableEntry, Course } from '../data/timetable'
import { courseExercises } from '../data/course-content'
import type { Exercise } from '../data/course-content'

function toMinutes(hour: number, minute: number): number {
  return hour * 60 + minute
}

/**
 * Returns the timetable entry that is currently in session, or null.
 */
export function getCurrentSession(now: Date = new Date()): TimetableEntry | null {
  const day = now.getDay()
  const nowMins = toMinutes(now.getHours(), now.getMinutes())

  return (
    timetable.find(
      (entry) =>
        entry.day === day &&
        nowMins >= toMinutes(entry.startHour, entry.startMinute) &&
        nowMins < toMinutes(entry.endHour, entry.endMinute),
    ) ?? null
  )
}

/**
 * Returns the next upcoming timetable entry (today or future days).
 */
export function getNextSession(now: Date = new Date()): TimetableEntry | null {
  const day = now.getDay()
  const nowMins = toMinutes(now.getHours(), now.getMinutes())

  // Look for next session today
  const todayNext = timetable
    .filter(
      (entry) =>
        entry.day === day &&
        toMinutes(entry.startHour, entry.startMinute) > nowMins,
    )
    .sort(
      (a, b) =>
        toMinutes(a.startHour, a.startMinute) -
        toMinutes(b.startHour, b.startMinute),
    )

  if (todayNext.length > 0) return todayNext[0]

  // Look for next session in coming days (wrap around week)
  for (let offset = 1; offset <= 7; offset++) {
    const targetDay = (day + offset) % 7
    const dayEntries = timetable
      .filter((entry) => entry.day === targetDay)
      .sort(
        (a, b) =>
          toMinutes(a.startHour, a.startMinute) -
          toMinutes(b.startHour, b.startMinute),
      )
    if (dayEntries.length > 0) return dayEntries[0]
  }

  return null
}

/**
 * Gets today's remaining timetable entries.
 */
export function getTodaySchedule(now: Date = new Date()): TimetableEntry[] {
  const day = now.getDay()
  return timetable
    .filter((entry) => entry.day === day)
    .sort(
      (a, b) =>
        toMinutes(a.startHour, a.startMinute) -
        toMinutes(b.startHour, b.startMinute),
    )
}

/**
 * Finds the course object for a given courseId.
 */
export function getCourseById(courseId: string): Course | undefined {
  return courses.find((c) => c.id === courseId)
}

/**
 * Returns all unsolved exercises across all courses.
 */
export function getUnsolvedExercises(): Exercise[] {
  return Object.values(courseExercises).flat().filter((ex) => !ex.solved)
}

/**
 * Returns unsolved exercises for a specific course.
 */
export function getUnsolvedExercisesForCourse(courseId: string): Exercise[] {
  return (courseExercises[courseId] ?? []).filter((ex) => !ex.solved)
}

/**
 * Formats a time like "8:00" or "14:30".
 */
export function formatTime(hour: number, minute: number): string {
  return `${hour}:${minute.toString().padStart(2, '0')}`
}

/**
 * Gets the day name for a timetable entry.
 */
export function getDayName(day: number): string {
  return dayNames[day]
}

/**
 * Determines the current "magic" route — where the user should be right now.
 * Priority: (1) active lecture session → (2) course with most unsolved exercises →
 * (3) upcoming session prep → (4) dashboard fallback.
 */
export function getMagicRoute(now: Date = new Date()): {
  path: string
  params: Record<string, string>
  description: string
} {
  const current = getCurrentSession(now)
  if (current) {
    return {
      path: '/course/$courseId',
      params: { courseId: current.courseId },
      description: `You're in ${current.courseName} right now!`,
    }
  }

  // If no active session, find the course with the most unsolved exercises
  const unsolved = getUnsolvedExercises()
  if (unsolved.length > 0) {
    // Group by course and pick the one with most unsolved
    const counts: Record<string, number> = {}
    for (const ex of unsolved) {
      counts[ex.courseId] = (counts[ex.courseId] ?? 0) + 1
    }
    const topCourseId = Object.entries(counts).sort(
      ([, a], [, b]) => b - a,
    )[0][0]
    const course = getCourseById(topCourseId)
    return {
      path: '/course/$courseId',
      params: { courseId: topCourseId },
      description: `Time to practice! ${course?.name ?? topCourseId} has unsolved exercises.`,
    }
  }

  const next = getNextSession(now)
  if (next) {
    return {
      path: '/course/$courseId',
      params: { courseId: next.courseId },
      description: `Prepare for ${next.courseName} coming up ${getDayName(next.day)} at ${formatTime(next.startHour, next.startMinute)}`,
    }
  }

  return {
    path: '/',
    params: {},
    description: 'All caught up! Enjoy your free time.',
  }
}
