import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Streamdown } from 'streamdown'
import type { Exercise } from '../data/course-content'
import { courseContent } from '../data/course-content'
import { remarkPlugins, rehypePlugins } from '../lib/markdown-config'

interface ExercisesSectionProps {
  exercises: Exercise[]
  courseId: string
}

export default function ExercisesSection({
  exercises,
  courseId,
}: ExercisesSectionProps) {
  if (exercises.length === 0) {
    return (
      <div className="py-12 text-center text-[var(--sea-ink-soft)]">
        <p className="text-4xl">🎉</p>
        <p className="mt-2 text-sm">
          No exercises available yet. Upload course materials to generate
          exercises.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          courseId={courseId}
        />
      ))}
    </div>
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

  const difficultyColors = {
    easy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    medium:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }

  // Look up prerequisite section names
  const allSections = (courseContent[courseId] ?? []).flatMap(
    (ch) => ch.sections,
  )
  const prerequisites = exercise.prerequisiteIds
    .map((id) => allSections.find((s) => s.id === id))
    .filter(Boolean)

  return (
    <div className="island-shell rounded-2xl p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-bold text-[var(--sea-ink)]">
          {exercise.title}
        </h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyColors[exercise.difficulty]}`}
        >
          {exercise.difficulty}
        </span>
      </div>

      {/* Prerequisites */}
      {prerequisites.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--kicker)]">
            Prerequisites
          </p>
          <div className="flex flex-wrap gap-1.5">
            {prerequisites.map((section) => (
              <Link
                key={section?.id}
                to="/course/$courseId"
                params={{ courseId }}
                search={{ tab: 'material', section: section?.id }}
                className="rounded-lg border border-[var(--line)] bg-[rgba(79,184,178,0.06)] px-2 py-0.5 text-xs text-[var(--lagoon-deep)] no-underline transition hover:bg-[rgba(79,184,178,0.14)]"
              >
                📖 {section?.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Problem statement */}
      <div className="mb-4 rounded-xl border border-[var(--line)] bg-[rgba(79,184,178,0.04)] p-4">
        <div className="prose prose-sm max-w-none text-[var(--sea-ink)]">
          <Streamdown mode="static" remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>{exercise.problem}</Streamdown>
        </div>
      </div>

      {/* Step-by-step reveal */}
      <div className="space-y-2">
        {exercise.steps.map((step, i) => (
          <div key={i}>
            {i < revealedSteps ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
                <div className="prose prose-sm max-w-none prose-p:m-0">
                  <Streamdown mode="static" remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>{step}</Streamdown>
                </div>
              </div>
            ) : i === revealedSteps ? (
              <button
                type="button"
                onClick={() => setRevealedSteps((prev) => prev + 1)}
                className="w-full rounded-lg border border-dashed border-[var(--lagoon)] bg-[rgba(79,184,178,0.06)] px-4 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.14)]"
              >
                Reveal {i === exercise.steps.length - 1 ? 'Solution' : `Hint ${i + 1}`} →
              </button>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-center text-xs text-[var(--sea-ink-soft)]">
                🔒 Step {i + 1} locked
              </div>
            )}
          </div>
        ))}
      </div>

      {revealedSteps === exercise.steps.length && (
        <div className="mt-3 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          ✓ Complete — all steps revealed
        </div>
      )}
    </div>
  )
}
