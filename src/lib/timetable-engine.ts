import { timetable, courses } from '#/data/timetable'
import type { TimetableEntry, Course } from '#/data/timetable'
import { courseContents } from '#/data/courses'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function getDayName(day: number): string {
  return DAY_NAMES[day] ?? ''
}

function toMinutes(h: number, m: number): number {
  return h * 60 + m
}

export function getCurrentSession(now: Date = new Date()): TimetableEntry | null {
  const day = now.getDay()
  const nowMinutes = toMinutes(now.getHours(), now.getMinutes())

  return (
    timetable.find(
      (entry) =>
        entry.day === day &&
        nowMinutes >= toMinutes(entry.startHour, entry.startMinute) &&
        nowMinutes < toMinutes(entry.endHour, entry.endMinute),
    ) ?? null
  )
}

export function getNextSession(now: Date = new Date()): TimetableEntry | null {
  const day = now.getDay()
  const nowMinutes = toMinutes(now.getHours(), now.getMinutes())

  // First, look for the next session today
  const todayNext = timetable
    .filter((entry) => entry.day === day && toMinutes(entry.startHour, entry.startMinute) > nowMinutes)
    .sort((a, b) => toMinutes(a.startHour, a.startMinute) - toMinutes(b.startHour, b.startMinute))

  if (todayNext.length > 0) return todayNext[0]

  // Look through the next 7 days
  for (let offset = 1; offset <= 7; offset++) {
    const checkDay = (day + offset) % 7
    const dayEntries = timetable
      .filter((entry) => entry.day === checkDay)
      .sort((a, b) => toMinutes(a.startHour, a.startMinute) - toMinutes(b.startHour, b.startMinute))

    if (dayEntries.length > 0) return dayEntries[0]
  }

  return null
}

export function getTodaySchedule(now: Date = new Date()): TimetableEntry[] {
  const day = now.getDay()
  return timetable
    .filter((entry) => entry.day === day)
    .sort((a, b) => toMinutes(a.startHour, a.startMinute) - toMinutes(b.startHour, b.startMinute))
}

export function getCourseById(courseId: string): Course | undefined {
  return courses.find((c) => c.id === courseId)
}

export function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

export function getUnsolvedExercises(): { courseId: string; courseName: string; count: number }[] {
  return courses.map((course) => {
    const content = courseContents[course.id]
    const unsolved = content?.exercises.filter((e) => !e.solved).length ?? 0
    return { courseId: course.id, courseName: course.name, count: unsolved }
  }).filter((c) => c.count > 0)
}

export function getMagicDestination(now: Date = new Date()): { path: string; label: string } {
  const current = getCurrentSession(now)
  if (current) {
    // During a session, go to the course page exercises tab
    return {
      path: `/course/${current.courseId}`,
      label: `Go to ${current.courseName} exercises`,
    }
  }

  const next = getNextSession(now)
  if (next) {
    return {
      path: `/course/${next.courseId}`,
      label: `Prepare for ${next.courseName}`,
    }
  }

  return { path: '/', label: 'No upcoming sessions' }
}

export function getNextSessionDay(entry: TimetableEntry, now: Date = new Date()): string {
  const today = now.getDay()
  if (entry.day === today) return 'Today'
  if (entry.day === (today + 1) % 7) return 'Tomorrow'
  return getDayName(entry.day)
}

export function getTomorrowSessions(now: Date = new Date()): TimetableEntry[] {
  const tomorrow = (now.getDay() + 1) % 7
  return timetable
    .filter((entry) => entry.day === tomorrow)
    .sort((a, b) => toMinutes(a.startHour, a.startMinute) - toMinutes(b.startHour, b.startMinute))
}

export interface TomorrowExerciseGroup {
  courseId: string
  courseName: string
  exercises: typeof courseContents[string]['exercises']
}

export function getTomorrowExercises(now: Date = new Date()): TomorrowExerciseGroup[] {
  const sessions = getTomorrowSessions(now)
  const courseIds = [...new Set(sessions.map((s) => s.courseId))]

  return courseIds
    .map((courseId) => {
      const content = courseContents[courseId]
      const session = sessions.find((s) => s.courseId === courseId)
      if (!content || !session) return null
      const unsolved = content.exercises.filter((e) => !e.solved)
      if (unsolved.length === 0) return null
      return { courseId, courseName: session.courseName, exercises: unsolved }
    })
    .filter(Boolean) as TomorrowExerciseGroup[]
}
