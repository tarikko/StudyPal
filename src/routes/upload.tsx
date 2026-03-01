import { createFileRoute } from '@tanstack/react-router'
import { CourseUpload } from '#/components/CourseUpload'

export const Route = createFileRoute('/upload')({ component: UploadPage })

function UploadPage() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      {/* Header */}
      <div className="rise-in mb-8">
        <p className="island-kicker mb-1">AI Course Builder</p>
        <h1 className="text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
          Upload Course Materials
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--sea-ink-soft)]">
          Upload your lecture notes, textbooks, or slides. Mistral AI will extract the content,
          build a structured course with chapters and sections, and generate practice exercises —
          all grounded in your own material.
        </p>

        {/* Pipeline badges */}
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
          {[
            '📄 OCR',
            '🔀 Chunking',
            '🧠 Embeddings',
            '🗄️ Qdrant',
            '🏗️ Skeleton',
            '✍️ Content',
            '✏️ Exercises',
          ].map((step, i, arr) => (
            <span key={step} className="flex items-center gap-1.5">
              <span className="rounded-full border border-[var(--lagoon)]/30 bg-[var(--lagoon)]/10 px-2.5 py-1 text-[var(--lagoon-deep)]">
                {step}
              </span>
              {i < arr.length - 1 && (
                <span className="text-[var(--sea-ink-soft)]">→</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="rise-in" style={{ animationDelay: '100ms' }}>
        <CourseUpload />
      </div>
    </main>
  )
}
