import type { Chapter, Section } from '#/data/courses'

interface ChapterSidebarProps {
  chapters: Chapter[]
  activeChapterId: string | null
  activeSectionId: string | null
  checkpointChapterId?: string
  checkpointSectionId?: string
  onSelectSection: (chapterId: string, sectionId: string) => void
}

export function ChapterSidebar({
  chapters,
  activeChapterId,
  activeSectionId,
  checkpointChapterId,
  checkpointSectionId,
  onSelectSection,
}: ChapterSidebarProps) {
  return (
    <nav className="space-y-1">
      {chapters.map((chapter) => (
        <div key={chapter.id} className="mb-3">
          <p className="mb-1 px-3 text-xs font-bold tracking-wider text-[var(--kicker)] uppercase">
            {chapter.title}
          </p>
          <ul className="space-y-0.5">
            {chapter.sections.map((section: Section) => {
              const isActive =
                activeChapterId === chapter.id && activeSectionId === section.id
              const isCheckpoint =
                checkpointChapterId === chapter.id && checkpointSectionId === section.id
              return (
                <li key={section.id}>
                  <button
                    onClick={() => onSelectSection(chapter.id, section.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? 'bg-[var(--lagoon)]/15 font-semibold text-[var(--lagoon-deep)]'
                        : 'text-[var(--sea-ink-soft)] hover:bg-white/60 hover:text-[var(--sea-ink)]'
                    }`}
                  >
                    <span>{section.title}</span>
                    {isCheckpoint && (
                      <span className="ml-2 shrink-0 text-[var(--lagoon-deep)]" title="Checkpoint">
                        🔖
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
