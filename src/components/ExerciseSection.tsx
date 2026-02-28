import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Streamdown } from 'streamdown'
import type { Exercise, CourseContent } from '#/data/courses'
import { remarkPlugins, rehypePlugins } from '#/lib/markdown-config'

interface ExerciseSectionProps {
  content: CourseContent
}

function DifficultyBadge({ difficulty }: { difficulty: Exercise['difficulty'] }) {
  const colors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${colors[difficulty]}`}>
      {difficulty}
    </span>
  )
}

function ExerciseCard({
  exercise,
  courseId,
}: {
  exercise: Exercise
  courseId: string
}) {
  const [revealedSteps, setRevealedSteps] = useState(0)
  const totalSteps = exercise.steps.length

  const revealNext = () => {
    if (revealedSteps < totalSteps) {
      setRevealedSteps((prev) => prev + 1)
    }
  }

  const hideAll = () => {
    setRevealedSteps(0)
  }

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[linear-gradient(165deg,var(--surface-strong),var(--surface))] p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-[var(--sea-ink)]">{exercise.title}</h3>
        <DifficultyBadge difficulty={exercise.difficulty} />
      </div>

      {/* Prerequisites */}
      {exercise.prerequisites.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold tracking-wider text-[var(--sea-ink-soft)] uppercase">
            Prerequisites
          </p>
          <div className="flex flex-wrap gap-2">
            {exercise.prerequisites.map((prereq) => (
              <Link
                key={`${prereq.chapterId}-${prereq.sectionId}`}
                to="/course/$courseId"
                params={{ courseId }}
                search={{ tab: 'material', chapter: prereq.chapterId, section: prereq.sectionId }}
                className="rounded-lg border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-medium text-[var(--lagoon-deep)] no-underline transition-colors hover:bg-[var(--link-bg-hover)]"
              >
                📖 {prereq.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Problem */}
      <div className="mb-4 rounded-lg bg-[var(--sand)]/50 p-4">
        <div className="prose prose-sm max-w-none text-[var(--sea-ink)]">
          <Streamdown mode="static" remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>{exercise.problem}</Streamdown>
        </div>
      </div>

      {/* Step-by-step reveal */}
      <div className="space-y-2">
        {exercise.steps.map((step, idx) => (
          <div
            key={idx}
            className={`rounded-lg border p-3 transition-all duration-300 ${
              idx < revealedSteps
                ? 'border-[var(--lagoon)]/30 bg-[var(--lagoon)]/5'
                : 'pointer-events-none border-transparent bg-gray-100'
            }`}
          >
            {idx < revealedSteps ? (
              <div className="prose prose-sm max-w-none text-[var(--sea-ink)] prose-p:m-0">
                <Streamdown mode="static" remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>{step}</Streamdown>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic select-none">
                Step {idx + 1} hidden — click &quot;Reveal Next Step&quot;
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-3">
        {revealedSteps < totalSteps ? (
          <button
            onClick={revealNext}
            className="rounded-lg bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
          >
            Reveal Next Step ({revealedSteps}/{totalSteps})
          </button>
        ) : (
          <span className="rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            ✓ All steps revealed
          </span>
        )}
        {revealedSteps > 0 && (
          <button
            onClick={hideAll}
            className="rounded-lg border border-[var(--line)] bg-white/50 px-4 py-2 text-sm text-[var(--sea-ink-soft)] transition-colors hover:bg-white/80"
          >
            Hide All
          </button>
        )}
      </div>
    </div>
  )
}

export function ExerciseSection({ content }: ExerciseSectionProps) {
  const [filterChapter, setFilterChapter] = useState<string>('all')

  const filtered =
    filterChapter === 'all'
      ? content.exercises
      : content.exercises.filter((e) => e.chapterId === filterChapter)

  return (
    <div>
      {/* Filter by chapter */}
      <div className="mb-6 flex items-center gap-3">
        <p className="text-sm font-semibold text-[var(--sea-ink-soft)]">Filter:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterChapter('all')}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              filterChapter === 'all'
                ? 'bg-[var(--lagoon)] text-white'
                : 'border border-[var(--line)] bg-white/50 text-[var(--sea-ink-soft)] hover:bg-white/80'
            }`}
          >
            All ({content.exercises.length})
          </button>
          {content.chapters.map((ch) => {
            const count = content.exercises.filter((e) => e.chapterId === ch.id).length
            if (count === 0) return null
            return (
              <button
                key={ch.id}
                onClick={() => setFilterChapter(ch.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  filterChapter === ch.id
                    ? 'bg-[var(--lagoon)] text-white'
                    : 'border border-[var(--line)] bg-white/50 text-[var(--sea-ink-soft)] hover:bg-white/80'
                }`}
              >
                {ch.title} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Exercise list */}
      <div className="space-y-6">
        {filtered.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            courseId={content.courseId}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-[var(--sea-ink-soft)]">
          No exercises for this chapter yet.
        </p>
      )}
    </div>
  )
}
