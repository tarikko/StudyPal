import { createFileRoute, Link } from '@tanstack/react-router'
import { BrainNourishment } from '#/components/BrainNourishment'

export const Route = createFileRoute('/brain-nourishment')({
  component: BrainNourishmentPage,
})

function BrainNourishmentPage() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      {/* Back nav */}
      <div className="rise-in mb-6 flex items-center gap-3">
        <Link
          to="/"
          className="rounded-lg border border-[var(--line)] bg-white/50 p-2 text-[var(--sea-ink-soft)] no-underline transition-colors hover:bg-white/80"
        >
          ←
        </Link>
        <div>
          <p className="text-xs font-semibold tracking-wider text-[var(--kicker)] uppercase">
            AI-Powered
          </p>
          <h1 className="text-xl font-bold text-[var(--sea-ink)]">Brain Nourishment</h1>
        </div>
      </div>

      <BrainNourishment />
    </main>
  )
}
