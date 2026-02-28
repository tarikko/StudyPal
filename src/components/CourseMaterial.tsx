import { useState } from 'react'
import type { Chapter, Section } from '../data/course-content'

interface CourseMaterialProps {
  chapters: Chapter[]
  courseId: string
  activeSectionId?: string
}

export default function CourseMaterial({
  chapters,
  courseId,
  activeSectionId,
}: CourseMaterialProps) {
  const [activeSection, setActiveSection] = useState<string>(
    activeSectionId ?? chapters[0]?.sections[0]?.id ?? '',
  )

  const currentSection = chapters
    .flatMap((ch) => ch.sections)
    .find((s) => s.id === activeSection)

  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <aside className="hidden w-56 shrink-0 md:block">
        <nav className="sticky top-24 space-y-4">
          {chapters.map((chapter) => (
            <div key={chapter.id}>
              <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-[var(--kicker)]">
                {chapter.title}
              </h4>
              <ul className="space-y-0.5">
                {chapter.sections.map((section) => (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                        activeSection === section.id
                          ? 'bg-[rgba(79,184,178,0.14)] font-semibold text-[var(--lagoon-deep)]'
                          : 'text-[var(--sea-ink-soft)] hover:bg-[rgba(79,184,178,0.06)] hover:text-[var(--sea-ink)]'
                      }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile chapter dropdown */}
      <div className="mb-4 md:hidden">
        <select
          value={activeSection}
          onChange={(e) => setActiveSection(e.target.value)}
          className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
        >
          {chapters.map((chapter) => (
            <optgroup key={chapter.id} label={chapter.title}>
              {chapter.sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {currentSection ? (
          <div>
            <h2 className="mb-4 text-xl font-bold text-[var(--sea-ink)]">
              {currentSection.title}
            </h2>
            <div className="prose max-w-none text-[var(--sea-ink)]">
              {renderContent(currentSection, setActiveSection)}
            </div>
          </div>
        ) : (
          <p className="text-[var(--sea-ink-soft)]">
            Select a section to view its content.
          </p>
        )}
      </div>
    </div>
  )
}

function renderContent(
  section: Section,
  onNavigate: (sectionId: string) => void,
) {
  let content = section.content

  // Build a map of reference labels to their target section IDs
  const refMap = new Map<string, string>()
  for (const ref of section.references) {
    refMap.set(ref.label, ref.targetSectionId)
  }

  // Split content by reference labels and create interactive hyperlinks
  const parts: Array<{ type: 'text' | 'link'; text: string; targetId?: string }> = []
  let remaining = content

  for (const ref of section.references) {
    const idx = remaining.toLowerCase().indexOf(ref.label.toLowerCase())
    if (idx !== -1) {
      if (idx > 0) {
        parts.push({ type: 'text', text: remaining.slice(0, idx) })
      }
      parts.push({
        type: 'link',
        text: remaining.slice(idx, idx + ref.label.length),
        targetId: ref.targetSectionId,
      })
      remaining = remaining.slice(idx + ref.label.length)
    }
  }
  if (remaining) {
    parts.push({ type: 'text', text: remaining })
  }

  if (parts.length === 0) {
    parts.push({ type: 'text', text: content })
  }

  return (
    <div className="space-y-3 whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        if (part.type === 'link' && part.targetId) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onNavigate(part.targetId!)}
              className="inline cursor-pointer border-b-2 border-[var(--lagoon)] bg-transparent p-0 font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.1)]"
              title="Jump to referenced section"
            >
              {part.text}
            </button>
          )
        }
        return <span key={i}>{part.text}</span>
      })}
    </div>
  )
}
