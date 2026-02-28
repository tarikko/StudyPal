import { useState, useCallback, useRef } from 'react'
import type { CourseContent } from '#/data/courses'
import { ChapterSidebar } from './ChapterSidebar'

interface CourseMaterialProps {
  content: CourseContent
  initialChapterId?: string
  initialSectionId?: string
}

function renderContentWithLinks(
  text: string,
  content: CourseContent,
  onNavigate: (chapterId: string, sectionId: string) => void,
) {
  // Build a map of all section titles to their IDs for semantic hyperlinks
  const sectionMap: { title: string; chapterId: string; sectionId: string }[] = []
  for (const chapter of content.chapters) {
    for (const section of chapter.sections) {
      sectionMap.push({ title: section.title, chapterId: chapter.id, sectionId: section.id })
    }
  }

  // Sort by title length (longest first) to match more specific terms first
  sectionMap.sort((a, b) => b.title.length - a.title.length)

  // Split text into paragraphs and render
  const paragraphs = text.split('\n\n')
  return paragraphs.map((paragraph, pIdx) => {
    const lines = paragraph.split('\n')
    return (
      <div key={pIdx} className="mb-4">
        {lines.map((line, lIdx) => {
          // Check for bold headers
          if (line.startsWith('**') && line.endsWith('**')) {
            return (
              <h4 key={lIdx} className="mb-2 mt-4 text-base font-bold text-[var(--sea-ink)]">
                {line.replace(/\*\*/g, '')}
              </h4>
            )
          }
          if (line.startsWith('**') && line.includes(':**')) {
            const parts = line.split(':**')
            const header = parts[0].replace(/\*\*/g, '')
            const rest = parts.slice(1).join(':**').replace(/\*\*/g, '')
            return (
              <p key={lIdx} className="mb-1 text-sm leading-relaxed text-[var(--sea-ink)]">
                <strong>{header}:</strong>
                {renderLineWithLinks(rest, sectionMap, onNavigate)}
              </p>
            )
          }
          if (line.startsWith('- ')) {
            return (
              <li key={lIdx} className="ml-4 list-disc text-sm leading-relaxed text-[var(--sea-ink)]">
                {renderLineWithLinks(line.substring(2), sectionMap, onNavigate)}
              </li>
            )
          }
          return (
            <p key={lIdx} className="text-sm leading-relaxed text-[var(--sea-ink)]">
              {renderLineWithLinks(line, sectionMap, onNavigate)}
            </p>
          )
        })}
      </div>
    )
  })
}

function renderLineWithLinks(
  line: string,
  sectionMap: { title: string; chapterId: string; sectionId: string }[],
  onNavigate: (chapterId: string, sectionId: string) => void,
) {
  // Bold inline formatting
  const parts: (string | React.ReactElement)[] = []
  const boldRegex = /\*\*(.*?)\*\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = boldRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.substring(lastIndex, match.index))
    }
    // Check if the bold text matches a section title
    const boldText = match[1]
    const linked = sectionMap.find(
      (s) => s.title.toLowerCase() === boldText.toLowerCase(),
    )
    if (linked) {
      parts.push(
        <button
          key={`link-${match.index}`}
          onClick={() => onNavigate(linked.chapterId, linked.sectionId)}
          className="cursor-pointer border-b border-[var(--lagoon)] font-bold text-[var(--lagoon-deep)] transition-colors hover:text-[var(--lagoon)]"
        >
          {boldText}
        </button>,
      )
    } else {
      parts.push(<strong key={`bold-${match.index}`}>{boldText}</strong>)
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < line.length) {
    parts.push(line.substring(lastIndex))
  }
  return parts.length > 0 ? parts : line
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
              {renderContentWithLinks(activeSection.content, content, handleSelectSection)}
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
