import { createFileRoute } from '@tanstack/react-router'
import { timetable, courses } from '#/data/timetable'
import { WeeklyGrid } from '#/components/WeeklyGrid'
import { UpcomingSessionsList } from '#/components/UpcomingSessionsList'
import { getCurrentSession, formatTime } from '#/lib/timetable-engine'

export const Route = createFileRoute('/timetable')({ component: TimetablePage })

function TimetablePage() {
  const current = getCurrentSession()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      {/* Header */}
      <div className="rise-in mb-6">
        <p className="island-kicker mb-1">Schedule</p>
        <h1 className="text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">My Timetable</h1>
      </div>

      {/* Active session banner */}
      {current && (
        <div
          className="rise-in mb-6 flex items-center gap-3 rounded-2xl border border-[var(--lagoon)]/30 bg-[var(--lagoon)]/10 px-5 py-4"
          style={{ animationDelay: '60ms' }}
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--lagoon)] opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--lagoon-deep)]" />
          </span>
          <p className="text-sm font-semibold text-[var(--sea-ink)]">
            Now in session:{' '}
            <span className="text-[var(--lagoon-deep)]">{current.courseName}</span>
            {' — '}
            {formatTime(current.startHour, current.startMinute)}–
            {formatTime(current.endHour, current.endMinute)} · {current.room}
          </p>
        </div>
      )}

      {/* Main layout */}
      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        {/* Weekly grid */}
        <div className="rise-in" style={{ animationDelay: '80ms' }}>
          <h2 className="mb-3 text-base font-bold text-[var(--sea-ink)]">📅 Weekly Schedule</h2>
          <WeeklyGrid entries={timetable} courses={courses} />
        </div>

        {/* Upcoming sessions */}
        <div className="rise-in" style={{ animationDelay: '160ms' }}>
          <h2 className="mb-3 text-base font-bold text-[var(--sea-ink)]">🔜 Upcoming</h2>
          <UpcomingSessionsList courses={courses} />
        </div>
      </div>
    </main>
  )
}
