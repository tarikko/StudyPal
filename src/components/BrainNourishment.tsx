import { useState, useCallback } from 'react'
import { courses } from '#/data/timetable'
import { courseContents } from '#/data/courses'
import { getCheckpoint } from '#/lib/checkpoint-store'
import { fetchBrainNourishment } from '#/api/brain-nourishment'
import type { CourseContext, CourseVideos, VideoRecommendation } from '#/api/brain-nourishment'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VIDEO_TYPE_META: Record<
  VideoRecommendation['type'],
  { label: string; emoji: string; color: string }
> = {
  lecture: { label: 'Lecture', emoji: '🎓', color: 'bg-blue-100 text-blue-700' },
  tutorial: { label: 'Tutorial', emoji: '📖', color: 'bg-purple-100 text-purple-700' },
  'problem-solving': { label: 'Problem Solving', emoji: '🧮', color: 'bg-amber-100 text-amber-700' },
  visualization: { label: 'Visualization', emoji: '✨', color: 'bg-teal-100 text-teal-700' },
  short: { label: 'Quick Overview', emoji: '⚡', color: 'bg-green-100 text-green-700' },
}

function buildYouTubeUrl(searchQuery: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
}

function buildCourseContexts(): CourseContext[] {
  return courses.map((course) => {
    const content = courseContents[course.id]
    const checkpoint = getCheckpoint(course.id)

    let currentChapterTitle: string | undefined
    let currentSectionTitle: string | undefined
    let previousSectionTitle: string | undefined

    if (checkpoint && content) {
      const chapter = content.chapters.find((c) => c.id === checkpoint.chapterId)
      currentChapterTitle = chapter?.title
      const sectionIdx = chapter?.sections.findIndex((s) => s.id === checkpoint.sectionId) ?? -1
      currentSectionTitle = chapter?.sections[sectionIdx]?.title
      if (sectionIdx > 0) {
        previousSectionTitle = chapter?.sections[sectionIdx - 1]?.title
      } else if (sectionIdx === 0 && content.chapters.length > 0) {
        // previous section is last section of previous chapter
        const chapterIdx = content.chapters.findIndex((c) => c.id === checkpoint.chapterId)
        if (chapterIdx > 0) {
          const prevChapter = content.chapters[chapterIdx - 1]
          previousSectionTitle = prevChapter?.sections[prevChapter.sections.length - 1]?.title
        }
      }
    }

    // Gather recent topics from the first 2 chapters' sections
    const recentTopics: string[] = content
      ? content.chapters.flatMap((ch) => ch.sections.map((s) => s.title)).slice(0, 6)
      : []

    const exerciseTopics: string[] = content
      ? content.exercises.map((e) => e.title).slice(0, 4)
      : []

    return {
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      currentChapterTitle,
      currentSectionTitle,
      previousSectionTitle,
      recentTopics,
      exerciseTopics,
    }
  })
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function VideoCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-strong)]">
      <div className="h-44 bg-[var(--line)]" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 rounded bg-[var(--line)]" />
        <div className="h-3 w-1/2 rounded bg-[var(--line)]" />
        <div className="h-3 w-full rounded bg-[var(--line)]" />
        <div className="h-3 w-5/6 rounded bg-[var(--line)]" />
      </div>
    </div>
  )
}

function VideoCard({
  video,
  courseColor,
}: {
  video: VideoRecommendation
  courseColor: string
}) {
  const meta = VIDEO_TYPE_META[video.type] ?? VIDEO_TYPE_META.lecture
  const ytUrl = buildYouTubeUrl(video.searchQuery)

  return (
    <a
      href={ytUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-xl border border-[var(--line)] bg-[linear-gradient(165deg,var(--surface-strong),var(--surface))] shadow-sm no-underline transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--lagoon)]/40"
    >
      {/* Thumbnail area */}
      <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${courseColor}`}>
        <div className="flex flex-col items-center gap-2 text-white/90">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-3xl shadow-lg transition-transform duration-200 group-hover:scale-110">
            ▶
          </div>
          <span className="text-xs font-semibold tracking-wide uppercase opacity-80">
            Watch on YouTube
          </span>
        </div>
        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
          {video.duration}
        </span>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${meta.color}`}>
            {meta.emoji} {meta.label}
          </span>
        </div>
        <h3 className="mb-1 line-clamp-2 text-sm font-bold leading-snug text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
          {video.title}
        </h3>
        <p className="mb-2 text-xs font-semibold text-[var(--lagoon-deep)]">
          📺 {video.channel}
        </p>
        <p className="line-clamp-2 text-xs leading-relaxed text-[var(--sea-ink-soft)]">
          {video.description}
        </p>
      </div>
    </a>
  )
}

function EmptyState({ onRefetch }: { onRefetch: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-6xl">🧠</div>
      <h3 className="mb-2 text-lg font-bold text-[var(--sea-ink)]">
        Ready to nourish your brain?
      </h3>
      <p className="mb-6 max-w-sm text-sm text-[var(--sea-ink-soft)]">
        Mistral AI will curate the best YouTube educational videos based on your current study
        progress and checkpoints.
      </p>
      <button
        onClick={onRefetch}
        className="rounded-full bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
      >
        ✨ Fetch Video Recommendations
      </button>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-5xl">⚠️</div>
      <h3 className="mb-2 text-lg font-bold text-[var(--sea-ink)]">Couldn't fetch recommendations</h3>
      <p className="mb-1 max-w-sm text-sm text-[var(--sea-ink-soft)]">{message}</p>
      {message.includes('MISTRAL_API_KEY') && (
        <p className="mb-4 max-w-sm text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
          Set the <code className="font-mono">MISTRAL_API_KEY</code> environment variable to enable
          AI-powered video recommendations.
        </p>
      )}
      <button
        onClick={onRetry}
        className="rounded-full border border-[var(--line)] bg-white/50 px-5 py-2 text-sm font-semibold text-[var(--sea-ink-soft)] transition-colors hover:bg-white/80"
      >
        Try Again
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type TabId = 'all' | string

export function BrainNourishment() {
  const [activeTab, setActiveTab] = useState<TabId>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<CourseVideos[] | null>(null)

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const contexts = buildCourseContexts()
      const result = await fetchBrainNourishment({ data: { courses: contexts } })
      setResults(result.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Videos to display based on active tab
  const displayedResults =
    activeTab === 'all' ? results : results?.filter((r) => r.courseId === activeTab)

  const getCourseColor = (courseId: string) =>
    courses.find((c) => c.id === courseId)?.color ?? 'from-gray-400 to-gray-600'

  const getCourseInfo = (courseId: string) => courses.find((c) => c.id === courseId)

  return (
    <div>
      {/* Header */}
      <div className="island-shell rise-in mb-6 overflow-hidden rounded-2xl px-6 py-8 sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.22),transparent_66%)]" />
        <p className="island-kicker mb-2">AI-Powered Learning</p>
        <h2 className="mb-3 text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
          🧠 Brain Nourishment
        </h2>
        <p className="max-w-2xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
          Mistral AI curates the best YouTube educational videos based on your current study
          checkpoints — bridging your previous and current lecture material.
        </p>
        {results && (
          <button
            onClick={fetchVideos}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--lagoon)]/40 bg-[var(--lagoon)]/10 px-4 py-2 text-xs font-bold text-[var(--lagoon-deep)] transition hover:bg-[var(--lagoon)]/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--lagoon)]/30 border-t-[var(--lagoon-deep)]" />
                Refreshing...
              </>
            ) : (
              <>✨ Refresh Recommendations</>
            )}
          </button>
        )}
      </div>

      {/* Course tabs */}
      {results && (
        <div
          className="rise-in mb-6 flex gap-1 overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-1"
          style={{ animationDelay: '60ms' }}
        >
          <button
            onClick={() => setActiveTab('all')}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
              activeTab === 'all'
                ? 'bg-white text-[var(--sea-ink)] shadow-sm'
                : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
            }`}
          >
            🌐 All Courses
            <span className="rounded-full bg-[var(--lagoon)]/20 px-1.5 py-0.5 text-[10px] font-bold text-[var(--lagoon-deep)]">
              {results.reduce((acc, r) => acc + r.videos.length, 0)}
            </span>
          </button>
          {courses.map((course) => {
            const courseResult = results.find((r) => r.courseId === course.id)
            return (
              <button
                key={course.id}
                onClick={() => setActiveTab(course.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
                  activeTab === course.id
                    ? 'bg-white text-[var(--sea-ink)] shadow-sm'
                    : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
                }`}
              >
                <span>{course.icon}</span>
                <span className="hidden sm:inline">{course.name}</span>
                <span className="sm:hidden">{course.code}</span>
                {courseResult && (
                  <span className="rounded-full bg-[var(--lagoon)]/20 px-1.5 py-0.5 text-[10px] font-bold text-[var(--lagoon-deep)]">
                    {courseResult.videos.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Content */}
      <div className="rise-in" style={{ animationDelay: '120ms' }}>
        {loading && !results ? (
          /* Initial loading skeleton */
          <div className="space-y-8">
            {courses.slice(0, 2).map((course) => (
              <div key={course.id}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-[var(--line)]" />
                  <div className="h-5 w-40 animate-pulse rounded bg-[var(--line)]" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <VideoCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchVideos} />
        ) : !results ? (
          <EmptyState onRefetch={fetchVideos} />
        ) : activeTab === 'all' ? (
          /* All courses view: grouped by course */
          <div className="space-y-10">
            {displayedResults?.map((courseResult) => {
              const courseInfo = getCourseInfo(courseResult.courseId)
              if (!courseInfo) return null
              return (
                <div key={courseResult.courseId}>
                  {/* Course section header */}
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${courseInfo.color} text-lg text-white shadow-sm`}
                    >
                      {courseInfo.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--sea-ink)]">
                        {courseInfo.name}
                      </h3>
                      <p className="text-xs text-[var(--sea-ink-soft)]">
                        {courseInfo.code} · {courseResult.videos.length} curated videos
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {courseResult.videos.map((video, idx) => (
                      <VideoCard
                        key={idx}
                        video={video}
                        courseColor={getCourseColor(courseResult.courseId)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Single course view */
          (() => {
            const courseResult = displayedResults?.[0]
            const courseInfo = getCourseInfo(activeTab)
            if (!courseResult || !courseInfo) {
              return (
                <p className="py-12 text-center text-sm text-[var(--sea-ink-soft)]">
                  No video recommendations for this course yet.
                </p>
              )
            }
            const checkpoint = getCheckpoint(activeTab)
            const content = courseContents[activeTab]
            const checkpointSection = checkpoint
              ? content?.chapters
                  .find((c) => c.id === checkpoint.chapterId)
                  ?.sections.find((s) => s.id === checkpoint.sectionId)?.title
              : null

            return (
              <div>
                {checkpointSection && (
                  <div className="mb-6 flex items-center gap-2 rounded-xl border border-[var(--lagoon)]/30 bg-[var(--lagoon)]/5 px-4 py-3">
                    <span className="text-lg">🔖</span>
                    <p className="text-sm text-[var(--sea-ink-soft)]">
                      Videos curated for your checkpoint:{' '}
                      <span className="font-semibold text-[var(--sea-ink)]">
                        {checkpointSection}
                      </span>
                    </p>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {courseResult.videos.map((video, idx) => (
                    <VideoCard
                      key={idx}
                      video={video}
                      courseColor={getCourseColor(activeTab)}
                    />
                  ))}
                </div>
              </div>
            )
          })()
        )}
      </div>
    </div>
  )
}
