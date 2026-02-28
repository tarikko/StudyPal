import { Link } from '@tanstack/react-router'
import { getTomorrowExercises, getDayName } from '#/lib/timetable-engine'

export function TomorrowExercises() {
  const now = new Date()
  const tomorrow = (now.getDay() + 1) % 7
  const tomorrowName = getDayName(tomorrow)
  const courseExercises = getTomorrowExercises(now)

  if (courseExercises.length === 0) return null

  const totalExercises = courseExercises.reduce((acc, c) => acc + c.exercises.length, 0)

  return (
    <section className="rise-in mt-8" style={{ animationDelay: '200ms' }}>
      <div className="island-shell rounded-2xl p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-lg text-white shadow-md">
            🎯
          </span>
          <div>
            <p className="text-xs font-semibold tracking-wider text-[var(--kicker)] uppercase">
              Prepare for {tomorrowName}
            </p>
            <h2 className="text-lg font-bold text-[var(--sea-ink)]">
              {totalExercises} exercise{totalExercises !== 1 ? 's' : ''} to practice
            </h2>
          </div>
        </div>

        <p className="mb-5 text-sm text-[var(--sea-ink-soft)]">
          Get ahead by working on exercises related to tomorrow&apos;s sessions. Practice makes perfect!
        </p>

        <div className="space-y-3">
          {courseExercises.map(({ courseId, courseName, exercises }) => (
            <Link
              key={courseId}
              to="/course/$courseId"
              params={{ courseId }}
              search={{ tab: 'exercises' }}
              className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-white/50 p-4 no-underline transition-colors hover:bg-white/80"
            >
              <div>
                <p className="text-sm font-bold text-[var(--sea-ink)]">{courseName}</p>
                <p className="text-xs text-[var(--sea-ink-soft)]">
                  {exercises.length} unsolved exercise{exercises.length !== 1 ? 's' : ''}
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                Practice →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
