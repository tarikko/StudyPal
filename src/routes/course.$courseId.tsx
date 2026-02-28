import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { courses } from '#/data/timetable'
import { courseContents } from '#/data/courses'
import { CourseMaterial } from '#/components/CourseMaterial'
import { ExerciseSection } from '#/components/ExerciseSection'

interface CourseSearch {
  tab?: 'material' | 'exercises'
  chapter?: string
  section?: string
}

export const Route = createFileRoute('/course/$courseId')({
  validateSearch: (search: Record<string, unknown>): CourseSearch => ({
    tab: (search.tab as CourseSearch['tab']) ?? 'material',
    chapter: search.chapter as string | undefined,
    section: search.section as string | undefined,
  }),
  component: CoursePage,
})

function CoursePage() {
  const { courseId } = Route.useParams()
  const { tab, chapter, section } = Route.useSearch()
  const navigate = useNavigate()

  const course = courses.find((c) => c.id === courseId)
  const content = courseContents[courseId]

  if (!course || !content) {
    return (
      <main className="page-wrap px-4 pb-8 pt-14">
        <div className="island-shell rounded-2xl p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold text-[var(--sea-ink)]">Course Not Found</h1>
          <p className="mb-6 text-[var(--sea-ink-soft)]">
            The course you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            to="/"
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    )
  }

  const activeTab = tab ?? 'material'

  const setTab = (newTab: 'material' | 'exercises') => {
    void navigate({
      to: '/course/$courseId',
      params: { courseId },
      search: newTab === 'material' ? { tab: newTab, chapter, section } : { tab: newTab },
      replace: true,
    })
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      {/* Course header */}
      <div className="rise-in mb-6 flex items-center gap-4">
        <Link
          to="/"
          className="rounded-lg border border-[var(--line)] bg-white/50 p-2 text-[var(--sea-ink-soft)] no-underline transition-colors hover:bg-white/80"
        >
          ←
        </Link>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${course.color} text-2xl text-white shadow-md`}
        >
          {course.icon}
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wider text-[var(--kicker)] uppercase">
            {course.code}
          </p>
          <h1 className="text-2xl font-bold text-[var(--sea-ink)]">{course.name}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="rise-in mb-6 flex gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-1" style={{ animationDelay: '80ms' }}>
        <button
          onClick={() => setTab('material')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'material'
              ? 'bg-white text-[var(--sea-ink)] shadow-sm'
              : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
          }`}
        >
          📖 Course Material
        </button>
        <button
          onClick={() => setTab('exercises')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'exercises'
              ? 'bg-white text-[var(--sea-ink)] shadow-sm'
              : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
          }`}
        >
          ✏️ Exercises
          {content.exercises.filter((e) => !e.solved).length > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-bold text-amber-700">
              {content.exercises.filter((e) => !e.solved).length}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="rise-in" style={{ animationDelay: '160ms' }}>
        {activeTab === 'material' ? (
          <CourseMaterial
            content={content}
            initialChapterId={chapter}
            initialSectionId={section}
          />
        ) : (
          <ExerciseSection
            content={content}
          />
        )}
      </div>
    </main>
  )
}
