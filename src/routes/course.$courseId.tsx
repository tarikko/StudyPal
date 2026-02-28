import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { courses } from '../data/timetable'
import { courseContent, courseExercises } from '../data/course-content'
import CourseMaterial from '../components/CourseMaterial'
import ExercisesSection from '../components/ExercisesSection'

type CourseTab = 'material' | 'exercises'

interface CourseSearch {
  tab?: CourseTab
  section?: string
}

export const Route = createFileRoute('/course/$courseId')({
  component: CoursePage,
  validateSearch: (search: Record<string, unknown>): CourseSearch => ({
    tab: (search.tab as CourseTab) ?? 'material',
    section: search.section as string | undefined,
  }),
})

function CoursePage() {
  const { courseId } = Route.useParams()
  const { tab, section } = Route.useSearch()
  const navigate = useNavigate()

  const course = courses.find((c) => c.id === courseId)
  const chapters = courseContent[courseId] ?? []
  const exercises = courseExercises[courseId] ?? []

  const [activeTab, setActiveTab] = useState<CourseTab>(tab ?? 'material')

  useEffect(() => {
    if (tab) setActiveTab(tab)
  }, [tab])

  const handleTabChange = (newTab: CourseTab) => {
    setActiveTab(newTab)
    navigate({
      to: '/course/$courseId',
      params: { courseId },
      search: { tab: newTab },
      replace: true,
    })
  }

  if (!course) {
    return (
      <main className="page-wrap px-4 pb-8 pt-14">
        <div className="island-shell rounded-2xl p-10 text-center">
          <p className="text-4xl">🔍</p>
          <h2 className="mt-3 text-xl font-bold text-[var(--sea-ink)]">
            Course Not Found
          </h2>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            The course &ldquo;{courseId}&rdquo; does not exist.
          </p>
          <a
            href="/"
            className="mt-4 inline-block rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
          >
            ← Back to Dashboard
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      {/* Course Header */}
      <section className="rise-in mb-6">
        <a
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--sea-ink-soft)] no-underline transition hover:text-[var(--sea-ink)]"
        >
          ← Dashboard
        </a>
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white"
            style={{ backgroundColor: course.color }}
          >
            {course.icon}
          </div>
          <div>
            <p className="island-kicker mb-0.5">{course.code}</p>
            <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
              {course.name}
            </h1>
            <p className="mt-0.5 text-xs text-[var(--sea-ink-soft)]">
              {course.professor}
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1">
        <button
          type="button"
          onClick={() => handleTabChange('material')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === 'material'
              ? 'bg-white text-[var(--sea-ink)] shadow-sm dark:bg-[var(--surface-strong)]'
              : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
          }`}
        >
          📖 Course Material
          <span className="ml-1.5 text-xs opacity-60">
            ({chapters.reduce((sum, ch) => sum + ch.sections.length, 0)}{' '}
            sections)
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('exercises')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === 'exercises'
              ? 'bg-white text-[var(--sea-ink)] shadow-sm dark:bg-[var(--surface-strong)]'
              : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
          }`}
        >
          ✏️ Exercises
          <span className="ml-1.5 text-xs opacity-60">
            ({exercises.length} total)
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <section className="island-shell rounded-2xl p-5 sm:p-6">
        {activeTab === 'material' ? (
          chapters.length > 0 ? (
            <CourseMaterial
              chapters={chapters}
              courseId={courseId}
              activeSectionId={section}
            />
          ) : (
            <div className="py-12 text-center">
              <p className="text-4xl">📤</p>
              <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
                Upload your PDFs, slides, or notes to generate structured course
                material.
              </p>
              <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
                Powered by Mistral OCR 3 &amp; Mistral Large 3
              </p>
            </div>
          )
        ) : (
          <ExercisesSection exercises={exercises} courseId={courseId} />
        )}
      </section>
    </main>
  )
}
