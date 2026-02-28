import {
  getCurrentSession,
  getNextSession,
  getTodaySchedule,
  formatTime,
  getCourseById,
  getNextSessionDay,
} from '#/lib/timetable-engine'
import type { TimetableEntry } from '#/data/timetable'
import { Link } from '@tanstack/react-router'

function SessionBadge({ type }: { type: TimetableEntry['type'] }) {
  const colors = {
    lecture: 'bg-blue-100 text-blue-700',
    tutorial: 'bg-emerald-100 text-emerald-700',
    lab: 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${colors[type]}`}>
      {type}
    </span>
  )
}

export function CurrentSession() {
  const now = new Date()
  const current = getCurrentSession(now)
  const next = getNextSession(now)
  const todaySchedule = getTodaySchedule(now)

  return (
    <div className="space-y-6">
      {/* Current Session */}
      <div className="rounded-2xl border border-[var(--line)] bg-[linear-gradient(165deg,var(--surface-strong),var(--surface))] p-6 shadow-[0_1px_0_var(--inset-glint)_inset,0_18px_34px_rgba(30,90,72,0.1),0_4px_14px_rgba(23,58,64,0.06)]">
        <h2 className="mb-4 text-lg font-bold text-[var(--sea-ink)]">
          {current ? '🟢 Current Session' : '📅 No Active Session'}
        </h2>
        {current ? (
          <Link
            to="/course/$courseId"
            params={{ courseId: current.courseId }}
            className="block rounded-xl bg-gradient-to-r from-[var(--lagoon)]/10 to-[var(--palm)]/10 p-4 no-underline transition-colors hover:from-[var(--lagoon)]/20 hover:to-[var(--palm)]/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-[var(--sea-ink)]">{current.courseName}</p>
                <p className="text-sm text-[var(--sea-ink-soft)]">
                  {formatTime(current.startHour, current.startMinute)} –{' '}
                  {formatTime(current.endHour, current.endMinute)} • {current.room}
                </p>
              </div>
              <SessionBadge type={current.type} />
            </div>
          </Link>
        ) : (
          <p className="text-sm text-[var(--sea-ink-soft)]">
            You have no lectures or tutorials right now. Time to study! 📖
          </p>
        )}
      </div>

      {/* Next Lecture */}
      {next && (
        <div className="rounded-2xl border border-[var(--line)] bg-[linear-gradient(165deg,var(--surface-strong),var(--surface))] p-6 shadow-[0_1px_0_var(--inset-glint)_inset,0_18px_34px_rgba(30,90,72,0.1),0_4px_14px_rgba(23,58,64,0.06)]">
          <h2 className="mb-4 text-lg font-bold text-[var(--sea-ink)]">⏭️ Next Up</h2>
          <Link
            to="/course/$courseId"
            params={{ courseId: next.courseId }}
            className="block rounded-xl border border-[var(--line)] bg-white/50 p-4 no-underline transition-colors hover:bg-white/80"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-[var(--sea-ink)]">{next.courseName}</p>
                <p className="text-sm text-[var(--sea-ink-soft)]">
                  {getNextSessionDay(next, now)} at{' '}
                  {formatTime(next.startHour, next.startMinute)} • {next.room}
                </p>
              </div>
              <SessionBadge type={next.type} />
            </div>
          </Link>
        </div>
      )}

      {/* Today's Schedule */}
      {todaySchedule.length > 0 && (
        <div className="rounded-2xl border border-[var(--line)] bg-[linear-gradient(165deg,var(--surface-strong),var(--surface))] p-6 shadow-[0_1px_0_var(--inset-glint)_inset,0_18px_34px_rgba(30,90,72,0.1),0_4px_14px_rgba(23,58,64,0.06)]">
          <h2 className="mb-4 text-lg font-bold text-[var(--sea-ink)]">📋 Today&apos;s Schedule</h2>
          <div className="space-y-3">
            {todaySchedule.map((entry, i) => {
              const course = getCourseById(entry.courseId)
              const nowMinutes = now.getHours() * 60 + now.getMinutes()
              const entryEnd = entry.endHour * 60 + entry.endMinute
              const isPast = entryEnd <= nowMinutes

              return (
                <Link
                  key={`${entry.courseId}-${i}`}
                  to="/course/$courseId"
                  params={{ courseId: entry.courseId }}
                  className={`flex items-center gap-3 rounded-lg border border-[var(--line)] p-3 no-underline transition-colors hover:bg-white/60 ${isPast ? 'opacity-50' : ''}`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${isPast ? 'bg-gray-300' : 'bg-[var(--lagoon)]'}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--sea-ink)]">
                      {course?.name ?? entry.courseName}
                    </p>
                    <p className="text-xs text-[var(--sea-ink-soft)]">
                      {formatTime(entry.startHour, entry.startMinute)} –{' '}
                      {formatTime(entry.endHour, entry.endMinute)} • {entry.room}
                    </p>
                  </div>
                  <SessionBadge type={entry.type} />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
