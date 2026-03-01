import { Link } from '@tanstack/react-router'
import type { TimetableEntry, Course } from '#/data/timetable'
import { formatTime } from '#/lib/timetable-engine'

const GRID_START_HOUR = 7
const GRID_END_HOUR = 21
const PX_PER_HOUR = 64
const TOTAL_HEIGHT = (GRID_END_HOUR - GRID_START_HOUR) * PX_PER_HOUR

const DAYS = [
  { label: 'Mon', full: 'Monday', day: 1 },
  { label: 'Tue', full: 'Tuesday', day: 2 },
  { label: 'Wed', full: 'Wednesday', day: 3 },
  { label: 'Thu', full: 'Thursday', day: 4 },
  { label: 'Fri', full: 'Friday', day: 5 },
]

const TYPE_LABELS: Record<string, string> = {
  lecture: 'Lec',
  tutorial: 'Tut',
  lab: 'Lab',
}

function toMin(h: number, m: number) {
  return h * 60 + m
}

function topPx(hour: number, minute: number) {
  return ((toMin(hour, minute) - GRID_START_HOUR * 60) / 60) * PX_PER_HOUR
}

function heightPx(sh: number, sm: number, eh: number, em: number) {
  return ((toMin(eh, em) - toMin(sh, sm)) / 60) * PX_PER_HOUR
}

interface Props {
  entries: TimetableEntry[]
  courses: Course[]
}

export function WeeklyGrid({ entries, courses }: Props) {
  const now = new Date()
  const currentDay = now.getDay()
  const currentTopPx = topPx(now.getHours(), now.getMinutes())
  const isCurrentTimeVisible =
    now.getHours() >= GRID_START_HOUR && now.getHours() < GRID_END_HOUR

  const hours = Array.from(
    { length: GRID_END_HOUR - GRID_START_HOUR },
    (_, i) => GRID_START_HOUR + i,
  )

  return (
    <div className="island-shell overflow-hidden rounded-2xl">
      {/* Day header */}
      <div
        className="grid border-b border-[var(--line)] bg-[var(--surface-strong)]"
        style={{ gridTemplateColumns: '3rem repeat(5, 1fr)' }}
      >
        <div className="border-r border-[var(--line)]" />
        {DAYS.map(({ label, full, day }) => (
          <div
            key={day}
            className={`border-r border-[var(--line)] px-2 py-3 text-center text-sm font-bold last:border-r-0 ${
              day === currentDay ? 'text-[var(--lagoon-deep)]' : 'text-[var(--sea-ink-soft)]'
            }`}
          >
            <span className="hidden sm:inline">{full}</span>
            <span className="sm:hidden">{label}</span>
            {day === currentDay && (
              <div className="mx-auto mt-1 h-1.5 w-1.5 rounded-full bg-[var(--lagoon)]" />
            )}
          </div>
        ))}
      </div>

      {/* Scrollable grid body */}
      <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
        <div
          className="grid"
          style={{ gridTemplateColumns: '3rem repeat(5, 1fr)' }}
        >
          {/* Time gutter */}
          <div
            className="relative border-r border-[var(--line)]"
            style={{ height: `${TOTAL_HEIGHT}px` }}
          >
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-1 text-[10px] font-medium text-[var(--sea-ink-soft)]"
                style={{ top: `${(h - GRID_START_HOUR) * PX_PER_HOUR - 7}px` }}
              >
                {h}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS.map(({ day }) => {
            const dayEntries = entries.filter((e) => e.day === day)
            return (
              <div
                key={day}
                className="relative border-r border-[var(--line)] last:border-r-0"
                style={{ height: `${TOTAL_HEIGHT}px` }}
              >
                {/* Hour lines */}
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-[var(--line)]"
                    style={{
                      top: `${(h - GRID_START_HOUR) * PX_PER_HOUR}px`,
                      opacity: 0.5,
                    }}
                  />
                ))}

                {/* Half-hour lines */}
                {hours.map((h) => (
                  <div
                    key={`half-${h}`}
                    className="absolute left-0 right-0 border-t border-dashed border-[var(--line)]"
                    style={{
                      top: `${(h - GRID_START_HOUR) * PX_PER_HOUR + PX_PER_HOUR / 2}px`,
                      opacity: 0.25,
                    }}
                  />
                ))}

                {/* Current time indicator (today column only) */}
                {day === currentDay && isCurrentTimeVisible && (
                  <div
                    className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
                    style={{ top: `${currentTopPx}px` }}
                  >
                    <div className="-ml-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500 shadow-sm" />
                    <div className="h-[1.5px] flex-1 bg-red-500 opacity-80" />
                  </div>
                )}

                {/* Session blocks */}
                {dayEntries.map((entry) => {
                  const course = courses.find((c) => c.id === entry.courseId)
                  const top = topPx(entry.startHour, entry.startMinute)
                  const h = heightPx(
                    entry.startHour,
                    entry.startMinute,
                    entry.endHour,
                    entry.endMinute,
                  )
                  const isNow =
                    day === currentDay &&
                    toMin(now.getHours(), now.getMinutes()) >=
                      toMin(entry.startHour, entry.startMinute) &&
                    toMin(now.getHours(), now.getMinutes()) <
                      toMin(entry.endHour, entry.endMinute)

                  return (
                    <Link
                      key={`${entry.courseId}-${entry.startHour}-${entry.startMinute}`}
                      to="/course/$courseId"
                      params={{ courseId: entry.courseId }}
                      className={`absolute left-1 right-1 overflow-hidden rounded-lg no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${isNow ? 'ring-2 ring-white/60' : ''}`}
                      style={{ top: `${top + 2}px`, height: `${h - 4}px` }}
                    >
                      <div
                        className={`h-full w-full bg-gradient-to-br ${course?.color ?? 'from-gray-400 to-gray-500'} p-1.5 text-white`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="truncate text-[11px] font-bold leading-tight">
                            {entry.courseName}
                          </p>
                          <span className="flex-shrink-0 rounded bg-white/20 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                            {TYPE_LABELS[entry.type] ?? entry.type}
                          </span>
                        </div>
                        {h > 38 && (
                          <p className="mt-0.5 truncate text-[10px] opacity-80">
                            {formatTime(entry.startHour, entry.startMinute)}–
                            {formatTime(entry.endHour, entry.endMinute)}
                          </p>
                        )}
                        {h > 58 && (
                          <p className="mt-0.5 truncate text-[10px] opacity-70">
                            {entry.room}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
