import { useState, useCallback, useRef } from "react";
import { Streamdown } from "streamdown";
import type { CourseContent } from "#/data/courses";
import { ChapterSidebar } from "./ChapterSidebar";
import { remarkPlugins, rehypePlugins } from "#/lib/markdown-config";
import { getCheckpoint, setCheckpoint, clearCheckpoint } from "#/lib/checkpoint-store";

interface CourseMaterialProps {
	content: CourseContent;
	initialChapterId?: string;
	initialSectionId?: string;
}

export function CourseMaterial({
	content,
	initialChapterId,
	initialSectionId,
}: CourseMaterialProps) {
	const firstChapter = content.chapters[0];
	const firstSection = firstChapter?.sections[0];

	const [activeChapterId, setActiveChapterId] = useState(
		initialChapterId ?? firstChapter?.id ?? ""
	);
	const [activeSectionId, setActiveSectionId] = useState(
		initialSectionId ?? firstSection?.id ?? ""
	);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [checkpoint, setCheckpointState] = useState(() =>
		getCheckpoint(content.courseId)
	);

	const contentRef = useRef<HTMLDivElement>(null);

	const handleSetCheckpoint = useCallback(() => {
		const cp = { courseId: content.courseId, chapterId: activeChapterId, sectionId: activeSectionId };
		setCheckpoint(cp);
		setCheckpointState(cp);
	}, [content.courseId, activeChapterId, activeSectionId]);

	const handleClearCheckpoint = useCallback(() => {
		clearCheckpoint(content.courseId);
		setCheckpointState(null);
	}, [content.courseId]);

	const handleSelectSection = useCallback(
		(chapterId: string, sectionId: string) => {
			setActiveChapterId(chapterId);
			setActiveSectionId(sectionId);
			setSidebarOpen(false);
			// Scroll the content area to top
			contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
		},
		[]
	);

	const activeChapter = content.chapters.find(
		(c) => c.id === activeChapterId
	);
	const activeSection = activeChapter?.sections.find(
		(s) => s.id === activeSectionId
	);

	// Find prev/next section for navigation
	const allSections: {
		chapterId: string;
		sectionId: string;
		title: string;
	}[] = [];
	for (const ch of content.chapters) {
		for (const sec of ch.sections) {
			allSections.push({
				chapterId: ch.id,
				sectionId: sec.id,
				title: sec.title,
			});
		}
	}
	const currentIdx = allSections.findIndex(
		(s) =>
			s.chapterId === activeChapterId && s.sectionId === activeSectionId
	);
	const prevSection = currentIdx > 0 ? allSections[currentIdx - 1] : null;
	const nextSection =
		currentIdx < allSections.length - 1
			? allSections[currentIdx + 1]
			: null;

	return (
		<div className="flex gap-6">
			{/* Desktop sidebar */}
			<div className="hidden w-64 shrink-0 lg:block">
				<div className="sticky top-20 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
					<p className="mb-3 text-xs font-bold tracking-wider text-[var(--sea-ink-soft)] uppercase">
						Chapters
					</p>
					<ChapterSidebar
						chapters={content.chapters}
						activeChapterId={activeChapterId}
						activeSectionId={activeSectionId}
						checkpointChapterId={checkpoint?.chapterId}
						checkpointSectionId={checkpoint?.sectionId}
						onSelectSection={handleSelectSection}
					/>
				</div>
			</div>

			{/* Mobile sidebar overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Mobile sidebar drawer */}
			<div
				className={`fixed top-0 left-0 z-[101] flex h-full w-72 flex-col bg-[var(--surface-strong)] shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
					<span className="text-sm font-bold text-[var(--sea-ink)]">
						Chapters
					</span>
					<button
						onClick={() => setSidebarOpen(false)}
						className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
						aria-label="Close sidebar"
					>
						✕
					</button>
				</div>
				<div className="flex-1 overflow-y-auto p-4">
					<ChapterSidebar
						chapters={content.chapters}
						activeChapterId={activeChapterId}
						activeSectionId={activeSectionId}
						checkpointChapterId={checkpoint?.chapterId}
						checkpointSectionId={checkpoint?.sectionId}
						onSelectSection={handleSelectSection}
					/>
				</div>
			</div>

			{/* Content area */}
			<div className="min-w-0 flex-1" ref={contentRef}>
				{/* Mobile chapter button */}
				<div className="mb-4 lg:hidden">
					<button
						onClick={() => setSidebarOpen(true)}
						className="flex w-full items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm font-medium text-[var(--sea-ink)]"
					>
						<span>📖</span>
						<span className="flex-1 truncate text-left">
							{activeChapter?.title} — {activeSection?.title}
						</span>
						<span className="text-[var(--sea-ink-soft)]">☰</span>
					</button>
				</div>

				{activeSection ? (
					<div>
						<div className="mb-2 flex items-center justify-between">
							<p className="text-xs font-semibold tracking-wider text-[var(--kicker)] uppercase">
								{activeChapter?.title}
							</p>
							{/* Checkpoint button */}
							{checkpoint?.chapterId === activeChapterId && checkpoint?.sectionId === activeSectionId ? (
								<button
									onClick={handleClearCheckpoint}
									className="flex items-center gap-1.5 rounded-full border border-[var(--lagoon)]/40 bg-[var(--lagoon)]/10 px-3 py-1 text-xs font-semibold text-[var(--lagoon-deep)] transition hover:bg-[var(--lagoon)]/20"
									title="Clear checkpoint"
								>
									🔖 Checkpoint set — clear
								</button>
							) : (
								<button
									onClick={handleSetCheckpoint}
									className="flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/50 px-3 py-1 text-xs font-medium text-[var(--sea-ink-soft)] transition hover:bg-white/80 hover:text-[var(--sea-ink)]"
									title="Set checkpoint here"
								>
									🔖 Set checkpoint
								</button>
							)}
						</div>
						<h2 className="mb-6 text-xl font-bold text-[var(--sea-ink)] sm:text-2xl">
							{activeSection.title}
						</h2>
						<div className="rounded-xl border border-[var(--line)] bg-white/50 p-4 sm:p-6">
							<div className="prose prose-sm max-w-none prose-headings:text-[var(--sea-ink)] prose-p:text-[var(--sea-ink)] prose-li:text-[var(--sea-ink)] prose-strong:text-[var(--sea-ink)]">
								<Streamdown
									mode="static"
									remarkPlugins={remarkPlugins}
									rehypePlugins={rehypePlugins}
								>
									{activeSection.content}
								</Streamdown>
							</div>
						</div>

						{/* Prev / Next navigation */}
						<div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
							{prevSection ? (
								<button
									onClick={() =>
										handleSelectSection(
											prevSection.chapterId,
											prevSection.sectionId
										)
									}
									className="rounded-lg border border-[var(--line)] bg-white/50 px-4 py-2 text-sm text-[var(--sea-ink-soft)] transition-colors hover:bg-white/80"
								>
									← {prevSection.title}
								</button>
							) : (
								<div />
							)}
							{nextSection ? (
								<button
									onClick={() =>
										handleSelectSection(
											nextSection.chapterId,
											nextSection.sectionId
										)
									}
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
					<p className="text-[var(--sea-ink-soft)]">
						Select a section from the sidebar.
					</p>
				)}
			</div>
		</div>
	);
}
