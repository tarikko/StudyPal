import { createFileRoute } from '@tanstack/react-router'
import { courses } from '../data/timetable'
import CourseCard from '../components/CourseCard'
import MagicButton from '../components/MagicButton'
import {
  getCurrentSession,
  getNextSession,
  getCourseById,
  getUnsolvedExercises,
  formatTime,
  getDayName,
  getTodaySchedule,
} from '../lib/timetable-utils'

export const Route = createFileRoute('/')({ component: Dashboard })

function Dashboard() {
  const currentSession = getCurrentSession()
  const nextSession = getNextSession()
  const todaySchedule = getTodaySchedule()
  const unsolvedExercises = getUnsolvedExercises()
  const currentCourse = currentSession
    ? getCourseById(currentSession.courseId)
    : null

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      {/* Hero Section */}
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">Your Learning OS</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Welcome to StudyPal
        </h1>
        <p className="mb-6 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Your courses, exercises, and schedule — all in one place. Let AI
          structure your learning and keep you on track.
        </p>

        {/* Current Session Card */}
        {currentSession && currentCourse ? (
          <div className="inline-flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Now: {currentSession.courseName}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {currentSession.room} ·{' '}
                {formatTime(currentSession.startHour, currentSession.startMinute)} –{' '}
                {formatTime(currentSession.endHour, currentSession.endMinute)}
              </p>
            </div>
          </div>
        ) : nextSession ? (
          <div className="inline-flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
            <span className="text-lg">📅</span>
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Next: {nextSession.courseName}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                {getDayName(nextSession.day)} at{' '}
                {formatTime(nextSession.startHour, nextSession.startMinute)} ·{' '}
                {nextSession.room}
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {/* Today's Schedule */}
      {todaySchedule.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-[var(--sea-ink)]">
            📅 Today&apos;s Schedule
          </h2>
          <div className="island-shell rounded-2xl p-4">
            <div className="space-y-2">
              {todaySchedule.map((entry) => {
                const course = getCourseById(entry.courseId)
                const isCurrent =
                  currentSession?.courseId === entry.courseId &&
                  currentSession?.startHour === entry.startHour
                return (
                  <div
                    key={`${entry.courseId}-${entry.startHour}-${entry.day}`}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                      isCurrent
                        ? 'bg-[rgba(79,184,178,0.12)] ring-1 ring-[var(--lagoon)]'
                        : 'hover:bg-[rgba(79,184,178,0.04)]'
                    }`}
                  >
                    <div
                      className="h-8 w-1 shrink-0 rounded-full"
                      style={{
                        backgroundColor: course?.color ?? 'var(--lagoon)',
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--sea-ink)]">
                        {entry.courseName}
                      </p>
                      <p className="text-xs text-[var(--sea-ink-soft)]">
                        {entry.room} · {entry.type}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs font-medium text-[var(--sea-ink-soft)]">
                      {formatTime(entry.startHour, entry.startMinute)} –{' '}
                      {formatTime(entry.endHour, entry.endMinute)}
                    </p>
                    {isCurrent && (
                      <span className="shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Live
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Unsolved Exercises Summary */}
      {unsolvedExercises.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-[var(--sea-ink)]">
            ✏️ Unsolved Exercises
          </h2>
          <div className="island-shell rounded-2xl p-4">
            <p className="mb-3 text-sm text-[var(--sea-ink-soft)]">
              You have{' '}
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {unsolvedExercises.length}
              </span>{' '}
              exercises waiting across your courses.
            </p>
            <div className="flex flex-wrap gap-2">
              {courses.map((course) => {
                const count = unsolvedExercises.filter(
                  (ex) => ex.courseId === course.id,
                ).length
                if (count === 0) return null
                return (
                  <a
                    key={course.id}
                    href={`/course/${course.id}?tab=exercises`}
                    className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--sea-ink)] no-underline transition hover:border-[var(--lagoon)]"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                    {course.name}: {count}
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Course Cards Grid */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-[var(--sea-ink)]">
          📚 Your Courses
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      </section>

      {/* Magic Button FAB */}
      <MagicButton />
    </main>
  )
}
