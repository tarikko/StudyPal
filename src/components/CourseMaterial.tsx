import { useState, useCallback, useRef } from 'react'
import { Streamdown } from 'streamdown'
import type { CourseContent } from '#/data/courses'
import { ChapterSidebar } from './ChapterSidebar'
import { remarkPlugins, rehypePlugins } from '#/lib/markdown-config'

interface CourseMaterialProps {
  content: CourseContent
  initialChapterId?: string
  initialSectionId?: string
}

export function CourseMaterial({ content, initialChapterId, initialSectionId }: CourseMaterialProps) {
  const firstChapter = content.chapters[0]
  const firstSection = firstChapter?.sections[0]

  const [activeChapterId, setActiveChapterId] = useState(
    initialChapterId ?? firstChapter?.id ?? '',
  )
  const [activeSectionId, setActiveSectionId] = useState(
    initialSectionId ?? firstSection?.id ?? '',
  )

  const contentRef = useRef<HTMLDivElement>(null)

  const handleSelectSection = useCallback((chapterId: string, sectionId: string) => {
    setActiveChapterId(chapterId)
    setActiveSectionId(sectionId)
    // Scroll the content area to top
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const activeChapter = content.chapters.find((c) => c.id === activeChapterId)
  const activeSection = activeChapter?.sections.find((s) => s.id === activeSectionId)

  // Find prev/next section for navigation
  const allSections: { chapterId: string; sectionId: string; title: string }[] = []
  for (const ch of content.chapters) {
    for (const sec of ch.sections) {
      allSections.push({ chapterId: ch.id, sectionId: sec.id, title: sec.title })
    }
  }
  const currentIdx = allSections.findIndex(
    (s) => s.chapterId === activeChapterId && s.sectionId === activeSectionId,
  )
  const prevSection = currentIdx > 0 ? allSections[currentIdx - 1] : null
  const nextSection = currentIdx < allSections.length - 1 ? allSections[currentIdx + 1] : null

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-4 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
          <p className="mb-3 text-xs font-bold tracking-wider text-[var(--sea-ink-soft)] uppercase">
            Chapters
          </p>
          <ChapterSidebar
            chapters={content.chapters}
            activeChapterId={activeChapterId}
            activeSectionId={activeSectionId}
            onSelectSection={handleSelectSection}
          />
        </div>
      </div>

      {/* Content area */}
      <div className="min-w-0 flex-1" ref={contentRef}>
        {/* Mobile chapter selector */}
        <div className="mb-4 lg:hidden">
          <select
            value={`${activeChapterId}:${activeSectionId}`}
            onChange={(e) => {
              const [chId, secId] = e.target.value.split(':')
              handleSelectSection(chId, secId)
            }}
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm"
          >
            {content.chapters.map((ch) =>
              ch.sections.map((sec) => (
                <option key={`${ch.id}:${sec.id}`} value={`${ch.id}:${sec.id}`}>
                  {ch.title} — {sec.title}
                </option>
              )),
            )}
          </select>
        </div>

        {activeSection ? (
          <div>
            <div className="mb-2">
              <p className="text-xs font-semibold tracking-wider text-[var(--kicker)] uppercase">
                {activeChapter?.title}
              </p>
            </div>
            <h2 className="mb-6 text-2xl font-bold text-[var(--sea-ink)]">{activeSection.title}</h2>
            <div className="rounded-xl border border-[var(--line)] bg-white/50 p-6">
              <div className="prose prose-sm max-w-none prose-headings:text-[var(--sea-ink)] prose-p:text-[var(--sea-ink)] prose-li:text-[var(--sea-ink)] prose-strong:text-[var(--sea-ink)]">
                <Streamdown mode="static" remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>{activeSection.content}</Streamdown>
              </div>
            </div>

            {/* Prev / Next navigation */}
            <div className="mt-6 flex justify-between">
              {prevSection ? (
                <button
                  onClick={() => handleSelectSection(prevSection.chapterId, prevSection.sectionId)}
                  className="rounded-lg border border-[var(--line)] bg-white/50 px-4 py-2 text-sm text-[var(--sea-ink-soft)] transition-colors hover:bg-white/80"
                >
                  ← {prevSection.title}
                </button>
              ) : (
                <div />
              )}
              {nextSection ? (
                <button
                  onClick={() => handleSelectSection(nextSection.chapterId, nextSection.sectionId)}
                  className="rounded-lg border border-[var(--line)] bg-white/50 px-4 py-2 text-sm text-[var(--sea-ink-soft)] transition-colors hover:bg-white/80"
                >
                  {nextSection.title} →
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>
        ) : (
          <p className="text-[var(--sea-ink-soft)]">Select a section from the sidebar.</p>
        )}
      </div>
    </div>
  )
}
