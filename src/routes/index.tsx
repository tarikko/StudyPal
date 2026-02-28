import { createFileRoute } from '@tanstack/react-router'
import { courses } from '#/data/timetable'
import { getUnsolvedExercises } from '#/lib/timetable-engine'
import { CourseCard } from '#/components/CourseCard'
import { CurrentSession } from '#/components/CurrentSession'
import { MagicButton } from '#/components/MagicButton'
import { TomorrowExercises } from '#/components/TomorrowExercises'

export const Route = createFileRoute('/')({ component: Dashboard })

function Dashboard() {
  const unsolved = getUnsolvedExercises()
  const totalUnsolved = unsolved.reduce((acc, c) => acc + c.count, 0)

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      {/* Hero */}
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">Your Learning OS</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Welcome to StudyPal 📚
        </h1>
        <p className="mb-4 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Your courses are ready. Review structured material, practice exercises
          with step-by-step hints, and stay on top of your schedule.
        </p>
        {totalUnsolved > 0 && (
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            <span>⚡</span> {totalUnsolved} unsolved exercises across{' '}
            {unsolved.length} course{unsolved.length !== 1 ? 's' : ''}
          </div>
        )}
      </section>

      {/* Main content: left = session info, right = course cards */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_2fr]">
        {/* Left column: session tracking */}
        <CurrentSession />

        {/* Right column: course cards */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-[var(--sea-ink)]">📖 Your Courses</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </div>

      {/* Tomorrow's Exercises */}
      <TomorrowExercises />

      {/* Magic Button */}
      <MagicButton />
    </main>
  )
}
