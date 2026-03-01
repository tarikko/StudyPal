import { useState, useRef } from "react";
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";
import { Streamdown } from "streamdown";
import { remarkPlugins, rehypePlugins } from "#/lib/markdown-config";
import type { Exercise } from "#/data/courses";
import { VERIFY_SOLUTION_API_PATH } from "#/api/verify-solution";
interface ExerciseVerifyProps {
	exercise: Exercise;
	onClose: () => void;
}

export function ExerciseVerify({ exercise, onClose }: ExerciseVerifyProps) {
	const [mode, setMode] = useState<"text" | "image">("text");
	const [solution, setSolution] = useState("");
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [imageBase64, setImageBase64] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { messages, sendMessage, isLoading, status } = useChat({
		connection: fetchServerSentEvents(VERIFY_SOLUTION_API_PATH, {
			body: {
				exerciseTitle: exercise.title,
				exerciseProblem: exercise.problem,
			},
		}),
	});

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			setImagePreview(result);
			// Extract base64 data
			const base64 = result.split(",")[1];
			setImageBase64(base64);
		};
		reader.readAsDataURL(file);
	};

	const handleSubmit = async () => {
		console.log("mode-------");
		if (mode === "text" && solution.trim()) {
			await sendMessage(`My solution:\n\n${solution}`);
		} else if (mode === "image" && imageBase64 && imagePreview) {
			// Extract MIME type from data URL (format: data:image/jpeg;base64,...)
			const dataUrlPrefix = imagePreview.split(";")[0];
			const mimeType = dataUrlPrefix?.includes(":")
				? dataUrlPrefix.split(":")[1]
				: "image/jpeg";
			await sendMessage({
				content: [
					{
						type: "text",
						content:
							"Here is my handwritten solution (see attached image):",
					},
					{
						type: "image",
						image: imageBase64,
					},
				],
			});
		}
	};

	const assistantMessage = messages.find((m) => m.role === "assistant");
	const hasResult = !!assistantMessage;

	return (
		<div className="mt-4 rounded-xl border border-[var(--lagoon)]/30 bg-[var(--lagoon)]/5 p-4 sm:p-5">
			<div className="mb-4 flex items-center justify-between">
				<h4 className="text-sm font-bold text-[var(--sea-ink)]">
					🔍 Verify Your Solution
				</h4>
				<button
					onClick={onClose}
					className="text-xs text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
				>
					✕ Close
				</button>
			</div>

			{!hasResult ? (
				<>
					{/* Mode toggle */}
					<div className="mb-4 flex gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] p-1">
						<button
							onClick={() => setMode("text")}
							className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
								mode === "text"
									? "bg-white text-[var(--sea-ink)] shadow-sm"
									: "text-[var(--sea-ink-soft)]"
							}`}
						>
							📝 Paste Solution
						</button>
						<button
							onClick={() => setMode("image")}
							className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
								mode === "image"
									? "bg-white text-[var(--sea-ink)] shadow-sm"
									: "text-[var(--sea-ink-soft)]"
							}`}
						>
							📸 Upload Photo
						</button>
					</div>

					{mode === "text" ? (
						<textarea
							value={solution}
							onChange={(e) => setSolution(e.target.value)}
							placeholder="Paste your solution here..."
							className="mb-3 w-full rounded-lg border border-[var(--line)] bg-white/80 p-3 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none"
							rows={5}
						/>
					) : (
						<div className="mb-3">
							{imagePreview ? (
								<div className="relative">
									<img
										src={imagePreview}
										alt="Solution preview"
										className="max-h-48 w-full rounded-lg border border-[var(--line)] object-contain"
									/>
									<button
										onClick={() => {
											setImagePreview(null);
											setImageBase64(null);
											if (fileInputRef.current)
												fileInputRef.current.value = "";
										}}
										className="absolute top-2 right-2 rounded-full bg-white/80 p-1 text-xs text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
									>
										✕
									</button>
								</div>
							) : (
								<button
									onClick={() =>
										fileInputRef.current?.click()
									}
									className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--line)] bg-white/50 py-8 text-[var(--sea-ink-soft)] transition-colors hover:border-[var(--lagoon)] hover:bg-white/80"
								>
									<span className="text-3xl">📷</span>
									<span className="text-sm font-medium">
										Take a photo or upload an image
									</span>
									<span className="text-xs">
										Supports JPG, PNG, WebP
									</span>
								</button>
							)}
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								capture="environment"
								onChange={handleImageUpload}
								className="hidden"
							/>
						</div>
					)}

					<button
						onClick={handleSubmit}
						disabled={
							isLoading ||
							(mode === "text" ? !solution.trim() : !imageBase64)
						}
						className="w-full rounded-lg bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:hover:shadow-sm"
					>
						{isLoading ? (
							<span className="inline-flex items-center gap-2">
								<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
								Analyzing...
							</span>
						) : (
							"Verify with Mistral AI"
						)}
					</button>
				</>
			) : (
				<div>
					<div className="rounded-lg border border-[var(--line)] bg-white/80 p-4">
						<div className="prose prose-sm max-w-none prose-headings:text-[var(--sea-ink)] prose-p:text-[var(--sea-ink)] prose-li:text-[var(--sea-ink)] prose-strong:text-[var(--sea-ink)]">
							{assistantMessage.parts
								?.filter((p) => p.type === "text")
								.map((p) => (
									<Streamdown
										mode={
											status === "streaming"
												? "streaming"
												: "static"
										}
										remarkPlugins={remarkPlugins}
										rehypePlugins={rehypePlugins}
									>
										{p.content}
									</Streamdown>
								))}
						</div>
					</div>
					<button
						onClick={onClose}
						className="mt-3 w-full rounded-lg border border-[var(--line)] bg-white/50 px-4 py-2 text-sm text-[var(--sea-ink-soft)] transition-colors hover:bg-white/80"
					>
						Done
					</button>
				</div>
			)}
		</div>
	);
}
