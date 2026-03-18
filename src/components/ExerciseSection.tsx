import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Exercise, CourseContent } from "#/data/courses";
import { ExerciseVerify } from "./ExerciseVerify";
import { Streamdown } from "streamdown";
import { rehypePlugins, remarkPlugins } from "#/lib/markdown-config";
import { generateMoreExercisesAction } from "#/api/generate-more-exercises";

interface ExerciseSectionProps {
	content: CourseContent;
	/** Show the "Generate More" button only for AI-generated courses. */
	isGenerated?: boolean;
}

function DifficultyBadge({
	difficulty,
}: {
	difficulty: Exercise["difficulty"];
}) {
	const colors = {
		easy: "bg-green-100 text-green-700",
		medium: "bg-amber-100 text-amber-700",
		hard: "bg-red-100 text-red-700",
	};
	return (
		<span
			className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${colors[difficulty]}`}
		>
			{difficulty}
		</span>
	);
}

function ExerciseCard({
	exercise,
	courseId,
}: {
	exercise: Exercise;
	courseId: string;
}) {
	const [revealedSteps, setRevealedSteps] = useState(0);
	const [showVerify, setShowVerify] = useState(false);
	const totalSteps = exercise.steps.length;

	const revealNext = () => {
		if (revealedSteps < totalSteps) {
			setRevealedSteps((prev) => prev + 1);
		}
	};

	const hideAll = () => {
		setRevealedSteps(0);
	};

	return (
		<div className="rounded-xl border border-[var(--line)] bg-[linear-gradient(165deg,var(--surface-strong),var(--surface))] p-6 shadow-sm">
			{/* Header */}
			<div className="mb-4 flex items-start justify-between gap-3">
				<h3 className="text-lg font-bold text-[var(--sea-ink)]">
					{exercise.title}
				</h3>
				<DifficultyBadge difficulty={exercise.difficulty} />
			</div>

			{/* Prerequisites */}
			{exercise.prerequisites.length > 0 && (
				<div className="mb-4">
					<p className="mb-2 text-xs font-semibold tracking-wider text-[var(--sea-ink-soft)] uppercase">
						Prerequisites
					</p>
					<div className="flex flex-wrap gap-2">
						{exercise.prerequisites.map((prereq) => (
							<Link
								key={`${prereq.chapterId}-${prereq.sectionId}`}
								to="/course/$courseId"
								params={{ courseId }}
								search={{
									tab: "material",
									chapter: prereq.chapterId,
									section: prereq.sectionId,
								}}
								className="rounded-lg border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-medium text-[var(--lagoon-deep)] no-underline transition-colors hover:bg-[var(--link-bg-hover)]"
							>
								📖 {prereq.label}
							</Link>
						))}
					</div>
				</div>
			)}

			{/* Problem */}
			<div className="mb-4 rounded-lg bg-[var(--sand)]/50 p-4">
				<p className="text-sm font-medium text-[var(--sea-ink)]">
					<Streamdown
						mode="static"
						remarkPlugins={remarkPlugins}
						rehypePlugins={rehypePlugins}
					>
						{exercise.problem}
					</Streamdown>
				</p>
			</div>

			{/* Step-by-step reveal */}
			<div className="space-y-2">
				{exercise.steps.map(
					(step, idx) =>
						idx < revealedSteps && (
							<div
								key={idx}
								className={`rounded-lg border p-3 transition-all duration-300 border-[var(--lagoon)]/30 bg-[var(--lagoon)]/5
						`}
							>
								{idx < revealedSteps ? (
									<p className="text-sm text-[var(--sea-ink)]">
										<Streamdown
											mode="static"
											remarkPlugins={remarkPlugins}
											rehypePlugins={rehypePlugins}
										>
											{step}
										</Streamdown>
									</p>
								) : (
									<></>
								)}
							</div>
						)
				)}
			</div>

			{/* Actions */}
			<div className="mt-4 flex flex-wrap items-center gap-3">
				{revealedSteps < totalSteps ? (
					<button
						onClick={revealNext}
						className="rounded-lg bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
					>
						Reveal Next Step ({revealedSteps}/{totalSteps})
					</button>
				) : (
					<span className="rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
						✓ All steps revealed
					</span>
				)}
				{revealedSteps > 0 && (
					<button
						onClick={hideAll}
						className="rounded-lg border border-[var(--line)] bg-white/50 px-4 py-2 text-sm text-[var(--sea-ink-soft)] transition-colors hover:bg-white/80"
					>
						Hide All
					</button>
				)}
				{!showVerify && (
					<button
						onClick={() => setShowVerify(true)}
						className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100"
					>
						🔍 Verify Solution
					</button>
				)}
			</div>

			{/* Exercise Verification */}
			{showVerify && (
				<ExerciseVerify
					exercise={exercise}
					onClose={() => setShowVerify(false)}
				/>
			)}
		</div>
	);
}

export function ExerciseSection({
	content,
	isGenerated = false,
}: ExerciseSectionProps) {
	const [filterChapter, setFilterChapter] = useState<string>("all");
	// Exercises appended locally after "Generate More" calls
	const [extraExercises, setExtraExercises] = useState<Exercise[]>([]);
	const [generating, setGenerating] = useState(false);
	const [genError, setGenError] = useState<string | null>(null);

	const allExercises = [...content.exercises, ...extraExercises];

	const filtered =
		filterChapter === "all"
			? allExercises
			: allExercises.filter((e) => e.chapterId === filterChapter);

	async function handleGenerateMore(targetChapterId?: string) {
		setGenerating(true);
		setGenError(null);
		try {
			const newOnes = await generateMoreExercisesAction({
				data: {
					courseId: content.courseId,
					chapters: content.chapters,
					existingExercises: allExercises,
					targetChapterId,
					count: 5,
				},
			});
			setExtraExercises((prev) => [...prev, ...newOnes]);
		} catch (err) {
			setGenError(
				err instanceof Error
					? err.message
					: "Generation failed. Try again."
			);
		} finally {
			setGenerating(false);
		}
	}

	return (
		<div>
			{/* Filter by chapter */}
			<div className="mb-6 flex flex-wrap items-center gap-3">
				<p className="text-sm font-semibold text-[var(--sea-ink-soft)]">
					Filter:
				</p>
				<div className="flex flex-wrap gap-2">
					<button
						onClick={() => setFilterChapter("all")}
						className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
							filterChapter === "all"
								? "bg-[var(--lagoon)] text-white"
								: "border border-[var(--line)] bg-white/50 text-[var(--sea-ink-soft)] hover:bg-white/80"
						}`}
					>
						All ({allExercises.length})
					</button>
					{content.chapters.map((ch) => {
						const count = allExercises.filter(
							(e) => e.chapterId === ch.id
						).length;
						if (count === 0) return null;
						return (
							<button
								key={ch.id}
								onClick={() => setFilterChapter(ch.id)}
								className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
									filterChapter === ch.id
										? "bg-[var(--lagoon)] text-white"
										: "border border-[var(--line)] bg-white/50 text-[var(--sea-ink-soft)] hover:bg-white/80"
								}`}
							>
								{ch.title} ({count})
							</button>
						);
					})}
				</div>

				{/* Per-chapter generate button (visible when a chapter is selected) */}
				{isGenerated && filterChapter !== "all" && (
					<button
						onClick={() => handleGenerateMore(filterChapter)}
						disabled={generating}
						className="ml-auto rounded-full border border-[var(--lagoon)]/40 bg-[var(--lagoon)]/10 px-3 py-1 text-xs font-semibold text-[var(--lagoon-deep)] transition-colors hover:bg-[var(--lagoon)]/20 disabled:opacity-50"
					>
						{generating ? "Generating…" : "+ More for this chapter"}
					</button>
				)}
			</div>

			{/* Exercise list */}
			<div className="space-y-6">
				{filtered.map((exercise) => (
					<ExerciseCard
						key={exercise.id}
						exercise={exercise}
						courseId={content.courseId}
					/>
				))}
			</div>

			{filtered.length === 0 && (
				<p className="py-12 text-center text-sm text-[var(--sea-ink-soft)]">
					No exercises for this chapter yet.
				</p>
			)}

			{/* Global "Generate More" button */}
			{isGenerated && (
				<div className="mt-8 flex flex-col items-center gap-3">
					{genError && (
						<p className="text-sm text-red-600">{genError}</p>
					)}
					<button
						onClick={() =>
							handleGenerateMore(
								filterChapter !== "all"
									? filterChapter
									: undefined
							)
						}
						disabled={generating}
						className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
					>
						{generating ? (
							<>
								<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
								Generating exercises…
							</>
						) : (
							<>
								✨ Generate More Exercises
								{filterChapter !== "all"
									? " for this Chapter"
									: ""}
							</>
						)}
					</button>
					<p className="text-xs text-[var(--sea-ink-soft)]">
						Generates 5 new exercises with varied problem types
					</p>
				</div>
			)}
		</div>
	);
}
