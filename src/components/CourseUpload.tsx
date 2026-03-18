import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
	startGeneration,
	retryGeneration,
	type StartGenerationInput,
} from "#/api/generate-course";
import { getGenerationStatus } from "#/api/generation-status";
import { getAllGenerationJobs } from "#/api/get-all-jobs";
import type { GenerationJob } from "#/lib/course-job-store";

// ─── Course colours the user can pick ────────────────────────────────────────
const COLOUR_OPTIONS = [
	{ label: "Ocean", value: "from-blue-500 to-indigo-600" },
	{ label: "Sunset", value: "from-orange-500 to-red-600" },
	{ label: "Forest", value: "from-emerald-500 to-teal-600" },
	{ label: "Violet", value: "from-purple-500 to-violet-600" },
	{ label: "Rose", value: "from-pink-500 to-rose-600" },
	{ label: "Amber", value: "from-amber-500 to-yellow-600" },
];

const ACCEPTED_TYPES = [
	"application/pdf",
	"image/jpeg",
	"image/png",
	"image/webp",
	"text/plain",
	"text/markdown",
];
const ACCEPTED_EXT = ".pdf,.jpg,.jpeg,.png,.webp,.txt,.md";

interface UploadedFile {
	name: string;
	mimeType: string;
	base64: string;
	sizeKB: number;
}

function readAsBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			resolve(result.split(",")[1] ?? "");
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({
	job,
	onRetry,
	onReset,
	isRetrying,
}: {
	job: GenerationJob;
	onRetry?: () => void;
	onReset: () => void;
	isRetrying: boolean;
}) {
	const isError = job.status === "error";
	const isDone = job.status === "done";

	return (
		<div className="island-shell mt-6 rounded-2xl p-6">
			<div className="mb-3 flex items-center justify-between">
				<p className="text-sm font-bold text-[var(--sea-ink)]">
					{isDone
						? "✅ Complete!"
						: isError
							? "❌ Error"
							: "⚙️ Generating course..."}
				</p>
				<span className="text-sm font-bold text-[var(--lagoon-deep)]">
					{job.progress}%
				</span>
			</div>

			{/* Track */}
			<div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
				<div
					className={`h-full rounded-full transition-all duration-500 ${
						isError
							? "bg-red-500"
							: isDone
								? "bg-[var(--lagoon)]"
								: "bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)]"
					}`}
					style={{ width: `${job.progress}%` }}
				/>
			</div>

			<p className="mt-3 text-xs text-[var(--sea-ink-soft)]">
				{job.message}
			</p>

			{isError && job.error && (
				<p className="mt-2 rounded-lg bg-red-50 p-3 text-xs text-red-600">
					{job.error}
				</p>
			)}

			{isError && (
				<div className="mt-4 flex flex-wrap gap-3">
					{job.canRetry && onRetry && (
						<button
							onClick={onRetry}
							disabled={isRetrying}
							className="rounded-full bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isRetrying ? "Retrying…" : "Resume Generation"}
						</button>
					)}
					<button
						onClick={onReset}
						className="rounded-full border border-[var(--line)] bg-white/70 px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink-soft)] transition-colors hover:bg-white"
					>
						Start Over
					</button>
				</div>
			)}

			{isDone && (
				<Link
					to="/course/$courseId"
					params={{ courseId: job.courseId }}
					className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)] px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition-all hover:shadow-md"
				>
					View Course →
				</Link>
			)}
		</div>
	);
}

// ─── Active jobs panel ────────────────────────────────────────────────────────

const STATUS_LABEL: Record<GenerationJob['status'], string> = {
  pending: '⏳ Queued',
  ocr: '📄 Extracting text',
  embedding: '🧠 Embedding',
  skeleton: '🏗️ Building structure',
  content: '✍️ Writing content',
  exercises: '✏️ Creating exercises',
  done: '✅ Complete',
  error: '❌ Error',
}

function JobRow({ j }: { j: GenerationJob }) {
  const isError = j.status === 'error'
  const isDone = j.status === 'done'
  const isActive = !isDone && !isError

  return (
    <li className="rounded-xl border border-[var(--line)] bg-white/60 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--sea-ink)]">
            {j.courseName ?? j.courseId}
          </p>
          <p className="mt-0.5 text-xs text-[var(--sea-ink-soft)]">
            {STATUS_LABEL[j.status]}
            {isActive && ` — ${j.message}`}
            {isError && j.error && ` — ${j.error}`}
          </p>
        </div>
        <span
          className={`flex-shrink-0 text-sm font-bold ${
            isError
              ? 'text-red-500'
              : isDone
              ? 'text-[var(--lagoon)]'
              : 'text-[var(--lagoon-deep)]'
          }`}
        >
          {j.progress}%
        </span>
        {isDone && (
          <Link
            to="/course/$courseId"
            params={{ courseId: j.courseId }}
            className="flex-shrink-0 rounded-full bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)] px-3 py-1 text-xs font-semibold text-white no-underline"
          >
            View →
          </Link>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isError
              ? 'bg-red-400'
              : isDone
              ? 'bg-[var(--lagoon)]'
              : 'bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)]'
          }`}
          style={{ width: `${j.progress}%` }}
        />
      </div>
    </li>
  )
}

const JOBS_POLL_MS = 5000

function ActiveJobsPanel({ currentJobId }: { currentJobId?: string }) {
  const [allJobs, setAllJobs] = useState<GenerationJob[]>([])
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchJobs = useCallback(async () => {
    try {
      const jobs = await getAllGenerationJobs()
      setAllJobs(jobs)
    } catch {
      // ignore transient errors
    }
  }, [])

  useEffect(() => {
    void fetchJobs()
    pollRef.current = setInterval(() => { void fetchJobs() }, JOBS_POLL_MS)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchJobs])

  // Filter out the job that's already shown in the main progress bar
  const otherJobs = allJobs.filter((j) => j.jobId !== currentJobId)

  if (otherJobs.length === 0) return null

  const active = otherJobs.filter((j) => j.status !== 'done' && j.status !== 'error')
  const recent = otherJobs.filter((j) => j.status === 'done' || j.status === 'error')

  return (
    <div className="island-shell mt-6 rounded-2xl p-6">
      <h2 className="mb-4 text-base font-bold text-[var(--sea-ink)]">
        🗂️ Recent Jobs
        {active.length > 0 && (
          <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)] text-[10px] font-bold text-white">
            {active.length}
          </span>
        )}
      </h2>
      <ul className="space-y-2">
        {otherJobs.map((j) => (
          <JobRow key={j.jobId} j={j} />
        ))}
      </ul>
      {recent.length > 0 && active.length > 0 && (
        <p className="mt-3 text-xs text-[var(--sea-ink-soft)]">
          Showing {active.length} active · {recent.length} completed
        </p>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CourseUpload() {
	// Form state
	const [courseName, setCourseName] = useState("");
	const [courseCode, setCourseCode] = useState("");
	const [courseIcon, setCourseIcon] = useState("📖");
	const [courseColor, setCourseColor] = useState(COLOUR_OPTIONS[0].value);
	const [courseDescription, setCourseDescription] = useState("");
	const [files, setFiles] = useState<UploadedFile[]>([]);
	const [isDragging, setIsDragging] = useState(false);

	// Job state
	const [job, setJob] = useState<GenerationJob | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [lastInput, setLastInput] = useState<StartGenerationInput | null>(
		null
	);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const clearPolling = useCallback(() => {
		if (pollRef.current) {
			clearInterval(pollRef.current);
			pollRef.current = null;
		}
	}, []);

	useEffect(() => clearPolling, [clearPolling]);

	// ─── File handling ─────────────────────────────────────────────────────────

	const addFiles = useCallback(async (fileList: FileList | File[]) => {
		const incoming = Array.from(fileList);
		const newFiles: UploadedFile[] = [];
		for (const file of incoming) {
			if (
				!ACCEPTED_TYPES.includes(file.type) &&
				!file.name.endsWith(".md")
			)
				continue;
			const base64 = await readAsBase64(file);
			newFiles.push({
				name: file.name,
				mimeType: file.type || "text/plain",
				base64,
				sizeKB: Math.round(file.size / 1024),
			});
		}
		setFiles((prev) => {
			const existingNames = new Set(prev.map((f) => f.name));
			return [
				...prev,
				...newFiles.filter((f) => !existingNames.has(f.name)),
			];
		});
	}, []);

	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			await addFiles(e.dataTransfer.files);
		},
		[addFiles]
	);

	const removeFile = (name: string) =>
		setFiles((prev) => prev.filter((f) => f.name !== name));

	// ─── Polling ───────────────────────────────────────────────────────────────

	function startPolling(jobId: string) {
		clearPolling();
		pollRef.current = setInterval(async () => {
			try {
				const updated = await getGenerationStatus({ data: { jobId } });
				if (updated) {
					setJob(updated);
					if (
						updated.status === "done" ||
						updated.status === "error"
					) {
						clearPolling();
					}
				}
			} catch {
				// ignore transient polling errors
			}
		}, 2000);
	}

	// ─── Submit ────────────────────────────────────────────────────────────────

	const handleSubmit = async () => {
		if (!courseName.trim() || !courseCode.trim() || files.length === 0)
			return;
		setIsSubmitting(true);
		setSubmitError(null);

		try {
			const courseId = courseCode
				.toLowerCase()
				.replace(/[^a-z0-9]/g, "-")
				.replace(/-+/g, "-");

			const input: StartGenerationInput = {
				files: files.map(({ name, base64, mimeType }) => ({
					name,
					base64,
					mimeType,
				})),
				courseMeta: {
					id: courseId,
					name: courseName.trim(),
					code: courseCode.trim().toUpperCase(),
					icon: courseIcon,
					color: courseColor,
					description:
						courseDescription.trim() ||
						`Generated from uploaded materials`,
				},
			};
			setLastInput(input);

			const { jobId } = await startGeneration({ data: input });

			// Seed initial job state in UI
			setJob({
				jobId,
				courseId,
				status: "pending",
				progress: 0,
				message: "Request received, starting pipeline...",
				createdAt: Date.now(),
			});

			startPolling(jobId);
		} catch (err) {
			setSubmitError(
				err instanceof Error ? err.message : "Unknown error"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleRetry = useCallback(async () => {
		if (!job || !job.canRetry || !lastInput) return;

		setIsSubmitting(true);
		setSubmitError(null);

		try {
			await retryGeneration({
				data: {
					jobId: job.jobId,
					files: lastInput.files,
					courseMeta: lastInput.courseMeta,
				},
			});

			setJob({
				...job,
				status: "pending",
				error: undefined,
				canRetry: false,
				message: "Retrying generation from the last checkpoint...",
			});
			startPolling(job.jobId);
		} catch (err) {
			setSubmitError(err instanceof Error ? err.message : "Retry failed");
		} finally {
			setIsSubmitting(false);
		}
	}, [job, lastInput]);

	const handleReset = useCallback(() => {
		clearPolling();
		setJob(null);
		setSubmitError(null);
	}, [clearPolling]);

	const canSubmit =
		!isSubmitting &&
		!job &&
		courseName.trim().length > 0 &&
		courseCode.trim().length > 0 &&
		files.length > 0;

	// ─── Render ────────────────────────────────────────────────────────────────

	return (
		<div className="mx-auto max-w-2xl">
			{/* Course metadata form */}
			<div className="island-shell mb-6 rounded-2xl p-6">
				<h2 className="mb-5 text-base font-bold text-[var(--sea-ink)]">
					📋 Course Details
				</h2>

				<div className="grid gap-4 sm:grid-cols-2">
					{/* Name */}
					<div className="sm:col-span-2">
						<label className="mb-1.5 block text-xs font-semibold text-[var(--sea-ink-soft)]">
							Course Name *
						</label>
						<input
							value={courseName}
							onChange={(e) => setCourseName(e.target.value)}
							placeholder="e.g. Quantum Mechanics"
							className="w-full rounded-xl border border-[var(--line)] bg-white/80 px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/40 focus:border-[var(--lagoon)] focus:outline-none"
							disabled={!!job}
						/>
					</div>

					{/* Code */}
					<div>
						<label className="mb-1.5 block text-xs font-semibold text-[var(--sea-ink-soft)]">
							Course Code *
						</label>
						<input
							value={courseCode}
							onChange={(e) => setCourseCode(e.target.value)}
							placeholder="e.g. PHYS-301"
							className="w-full rounded-xl border border-[var(--line)] bg-white/80 px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/40 focus:border-[var(--lagoon)] focus:outline-none"
							disabled={!!job}
						/>
					</div>

					{/* Icon */}
					<div>
						<label className="mb-1.5 block text-xs font-semibold text-[var(--sea-ink-soft)]">
							Icon (emoji)
						</label>
						<input
							value={courseIcon}
							onChange={(e) => setCourseIcon(e.target.value)}
							placeholder="📖"
							className="w-full rounded-xl border border-[var(--line)] bg-white/80 px-4 py-2.5 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon)] focus:outline-none"
							maxLength={4}
							disabled={!!job}
						/>
					</div>

					{/* Description */}
					<div className="sm:col-span-2">
						<label className="mb-1.5 block text-xs font-semibold text-[var(--sea-ink-soft)]">
							Description (optional)
						</label>
						<input
							value={courseDescription}
							onChange={(e) =>
								setCourseDescription(e.target.value)
							}
							placeholder="Short description of the course"
							className="w-full rounded-xl border border-[var(--line)] bg-white/80 px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/40 focus:border-[var(--lagoon)] focus:outline-none"
							disabled={!!job}
						/>
					</div>

					{/* Colour picker */}
					<div className="sm:col-span-2">
						<label className="mb-2 block text-xs font-semibold text-[var(--sea-ink-soft)]">
							Card Colour
						</label>
						<div className="flex flex-wrap gap-2">
							{COLOUR_OPTIONS.map((opt) => (
								<button
									key={opt.value}
									onClick={() => setCourseColor(opt.value)}
									disabled={!!job}
									className={`h-8 w-8 rounded-lg bg-gradient-to-br transition-all ${opt.value} ${
										courseColor === opt.value
											? "ring-2 ring-[var(--lagoon-deep)] ring-offset-2 scale-110"
											: "opacity-70 hover:opacity-100"
									}`}
									title={opt.label}
								/>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* File upload zone */}
			<div className="island-shell mb-6 rounded-2xl p-6">
				<h2 className="mb-5 text-base font-bold text-[var(--sea-ink)]">
					📂 Course Materials
				</h2>

				{/* Drop zone */}
				{!job && (
					<div
						onDragOver={(e) => {
							e.preventDefault();
							setIsDragging(true);
						}}
						onDragLeave={() => setIsDragging(false)}
						onDrop={handleDrop}
						onClick={() => fileInputRef.current?.click()}
						className={`mb-4 flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed py-10 text-center transition-colors ${
							isDragging
								? "border-[var(--lagoon)] bg-[var(--lagoon)]/10"
								: "border-[var(--line)] bg-white/40 hover:border-[var(--lagoon)] hover:bg-white/60"
						}`}
					>
						<span className="text-4xl">📄</span>
						<div>
							<p className="text-sm font-semibold text-[var(--sea-ink)]">
								Drop files here or click to browse
							</p>
							<p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
								PDF, images (JPG/PNG/WebP), plain text (.txt),
								Markdown (.md)
							</p>
						</div>
					</div>
				)}

				<input
					ref={fileInputRef}
					type="file"
					accept={ACCEPTED_EXT}
					multiple
					aria-label="Upload course materials"
					title="Upload course materials"
					className="hidden"
					onChange={(e) => {
						if (e.target.files) void addFiles(e.target.files);
					}}
				/>

				{/* File list */}
				{files.length > 0 && (
					<ul className="space-y-2">
						{files.map((f) => (
							<li
								key={f.name}
								className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white/60 px-4 py-2.5"
							>
								<span className="text-lg">
									{f.mimeType === "application/pdf"
										? "📕"
										: f.mimeType.startsWith("image/")
											? "🖼️"
											: "📄"}
								</span>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium text-[var(--sea-ink)]">
										{f.name}
									</p>
									<p className="text-xs text-[var(--sea-ink-soft)]">
										{f.sizeKB} KB
									</p>
								</div>
								{!job && (
									<button
										onClick={() => removeFile(f.name)}
										className="flex-shrink-0 rounded-lg p-1 text-[var(--sea-ink-soft)] transition-colors hover:bg-red-50 hover:text-red-500"
										title="Remove"
									>
										✕
									</button>
								)}
							</li>
						))}
					</ul>
				)}
			</div>

			{/* Error */}
			{submitError && (
				<p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
					{submitError}
				</p>
			)}

			{/* Generate button */}
			{!job && (
				<button
					onClick={() => void handleSubmit()}
					disabled={!canSubmit}
					className="w-full rounded-2xl bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)] px-6 py-4 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-md"
				>
					{isSubmitting ? (
						<span className="inline-flex items-center gap-2">
							<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
							Uploading...
						</span>
					) : (
						"✨ Generate Course with Mistral AI"
					)}
				</button>
			)}

			{/* Progress */}
			{job && (
				<ProgressBar
					job={job}
					onRetry={
						job.canRetry ? () => void handleRetry() : undefined
					}
					onReset={handleReset}
					isRetrying={isSubmitting}
				/>
			)}

			{/* All jobs panel */}
			<ActiveJobsPanel currentJobId={job?.jobId} />
		</div>
	);
}
