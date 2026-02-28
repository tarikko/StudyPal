import { useState } from 'react'
import { Streamdown } from 'streamdown'
import type { Chapter } from '../data/course-content'
import { remarkPlugins, rehypePlugins } from '../lib/markdown-config'

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
              <Streamdown mode="static" remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>{currentSection.content}</Streamdown>
            </div>
            {currentSection.references.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--kicker)]">
                  See also:
                </span>
                {currentSection.references.map((ref) => (
                  <button
                    key={ref.targetSectionId}
                    type="button"
                    onClick={() => setActiveSection(ref.targetSectionId)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[rgba(79,184,178,0.06)] px-2 py-0.5 text-xs font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.14)]"
                    title="Jump to referenced section"
                  >
                    🔗 {ref.label}
                  </button>
                ))}
              </div>
            )}
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
