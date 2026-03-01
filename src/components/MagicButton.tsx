import { useNavigate } from '@tanstack/react-router'
import { getMagicDestination } from '#/lib/timetable-engine'

export function MagicButton() {
  const navigate = useNavigate()
  const destination = getMagicDestination()

  return (
    <button
      onClick={() => {
        if (destination.to !== '/') {
          void navigate({
            to: destination.to,
            params: destination.params,
            search: destination.search,
          })
        }
      }}
      className="fixed right-6 bottom-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--lagoon)] to-[var(--lagoon-deep)] text-2xl text-white shadow-[0_8px_32px_rgba(79,184,178,0.4)] transition-all duration-200 hover:scale-110 hover:shadow-[0_12px_40px_rgba(79,184,178,0.5)] active:scale-95"
      title={destination.label}
      aria-label={destination.label}
    >
      ✨
    </button>
  )
}
