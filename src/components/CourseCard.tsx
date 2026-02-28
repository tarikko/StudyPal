import { Link } from '@tanstack/react-router'
import type { Course } from '#/data/timetable'
import { courseContents } from '#/data/courses'

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const content = courseContents[course.id]
  const totalExercises = content?.exercises.length ?? 0
  const unsolvedCount = content?.exercises.filter((e) => !e.solved).length ?? 0
  const chapterCount = content?.chapters.length ?? 0

  return (
    <Link
      to="/course/$courseId"
      params={{ courseId: course.id }}
      className="group block rounded-2xl border border-[var(--line)] bg-[linear-gradient(165deg,var(--surface-strong),var(--surface))] p-6 shadow-[0_1px_0_var(--inset-glint)_inset,0_18px_34px_rgba(30,90,72,0.1),0_4px_14px_rgba(23,58,64,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--lagoon-deep)_35%,var(--line))] no-underline"
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${course.color} text-2xl text-white shadow-md`}
        >
          {course.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wider text-[var(--kicker)] uppercase">
            {course.code}
          </p>
          <h3 className="truncate text-lg font-bold text-[var(--sea-ink)]">{course.name}</h3>
        </div>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-[var(--sea-ink-soft)]">{course.description}</p>
      <div className="flex items-center gap-4 text-xs text-[var(--sea-ink-soft)]">
        <span className="flex items-center gap-1">
          <span className="text-sm">📚</span> {chapterCount} chapters
        </span>
        <span className="flex items-center gap-1">
          <span className="text-sm">✏️</span> {totalExercises} exercises
        </span>
        {unsolvedCount > 0 && (
          <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            {unsolvedCount} unsolved
          </span>
        )}
      </div>
    </Link>
  )
}
