import { Link } from '@tanstack/react-router'
import type { Course } from '../data/timetable'
import { getUnsolvedExercisesForCourse } from '../lib/timetable-utils'

interface CourseCardProps {
  course: Course
  index: number
}

export default function CourseCard({ course, index }: CourseCardProps) {
  const unsolved = getUnsolvedExercisesForCourse(course.id)

  return (
    <Link
      to="/course/$courseId"
      params={{ courseId: course.id }}
      className="island-shell rise-in group relative flex flex-col rounded-2xl p-5 no-underline"
      style={{ animationDelay: `${index * 80 + 100}ms` }}
    >
      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl text-white"
        style={{ backgroundColor: course.color }}
      >
        {course.icon}
      </div>
      <p className="island-kicker mb-1">{course.code}</p>
      <h3 className="mb-1 text-base font-bold text-[var(--sea-ink)]">
        {course.name}
      </h3>
      <p className="mb-3 text-xs text-[var(--sea-ink-soft)]">
        {course.professor}
      </p>
      {unsolved.length > 0 && (
        <span className="mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          {unsolved.length} unsolved
        </span>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent transition group-hover:border-[var(--lagoon)]" />
    </Link>
  )
}
