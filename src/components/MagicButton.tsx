import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { getMagicRoute } from '../lib/timetable-utils'

export default function MagicButton() {
  const navigate = useNavigate()
  const [tooltip, setTooltip] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const TOOLTIP_DISPLAY_MS = 1500

  const handleClick = () => {
    setIsAnimating(true)
    const magic = getMagicRoute()

    setTooltip(magic.description)

    setTimeout(() => {
      setIsAnimating(false)
      setTooltip(null)

      if (magic.path === '/course/$courseId' && magic.params.courseId) {
        navigate({
          to: '/course/$courseId',
          params: { courseId: magic.params.courseId },
        })
      }
    }, TOOLTIP_DISPLAY_MS)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {tooltip && (
        <div className="rise-in max-w-xs rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-sm text-[var(--sea-ink)] shadow-lg backdrop-blur-md">
          ✨ {tooltip}
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--lagoon)] to-[var(--palm)] text-2xl text-white shadow-[0_8px_32px_rgba(79,184,178,0.35)] transition hover:scale-110 hover:shadow-[0_12px_40px_rgba(79,184,178,0.45)] active:scale-95 ${isAnimating ? 'animate-pulse' : ''}`}
        title="Magic Button — Go to what you should be doing right now"
      >
        ⚡
      </button>
    </div>
  )
}
