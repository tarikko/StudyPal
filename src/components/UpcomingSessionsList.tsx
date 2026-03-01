import { Link } from '@tanstack/react-router'
import type { Course } from '#/data/timetable'
import { getUpcomingSessions, formatTime, getNextSessionDay } from '#/lib/timetable-engine'

const TYPE_COLORS: Record<string, string> = {
  lecture: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  tutorial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  lab: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
}

interface Props {
  courses: Course[]
}

export function UpcomingSessionsList({ courses }: Props) {
  const upcoming = getUpcomingSessions(6)

  if (upcoming.length === 0) {
    return (
      <div className="island-shell rounded-2xl px-6 py-8 text-center">
        <p className="text-sm text-[var(--sea-ink-soft)]">No upcoming sessions this week.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {upcoming.map((entry, idx) => {
        const course = courses.find((c) => c.id === entry.courseId)
        const dayLabel = getNextSessionDay(entry)
        const isFirst = idx === 0

        return (
          <Link
            key={`${entry.courseId}-${entry.day}-${entry.startHour}-${entry.startMinute}`}
            to="/course/$courseId"
            params={{ courseId: entry.courseId }}
            className="island-shell group flex items-center gap-3 rounded-xl px-4 py-3 no-underline transition-all hover:-translate-y-0.5"
          >
            {/* Course icon */}
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${course?.color ?? 'from-gray-400 to-gray-500'} text-base text-white shadow-sm`}
            >
              {course?.icon ?? '📚'}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--sea-ink)]">
                {entry.courseName}
              </p>
              <p className="text-xs text-[var(--sea-ink-soft)]">
                {dayLabel} · {formatTime(entry.startHour, entry.startMinute)}–
                {formatTime(entry.endHour, entry.endMinute)}
              </p>
              <p className="truncate text-[11px] text-[var(--sea-ink-soft)] opacity-70">
                {entry.room}
              </p>
            </div>

            {/* Type badge + next indicator */}
            <div className="flex flex-col items-end gap-1">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_COLORS[entry.type] ?? ''}`}
              >
                {entry.type}
              </span>
              {isFirst && (
                <span className="text-[10px] font-bold text-[var(--lagoon-deep)]">next →</span>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
