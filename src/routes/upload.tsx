import { createFileRoute } from "@tanstack/react-router";
import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
} from "@clerk/tanstack-react-start";
import { CourseUpload } from "#/components/CourseUpload";
import { isClerkEnabled } from "#/lib/auth";

export const Route = createFileRoute("/upload")({ component: UploadPage });

function UploadPage() {
	return (
		<main className="page-wrap px-4 pb-8 pt-14">
			{/* Header */}
			<div className="rise-in mb-8">
				<p className="island-kicker mb-1">AI Course Builder</p>
				<h1 className="text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
					Upload Course Materials
				</h1>
				<p className="mt-2 max-w-xl text-sm text-[var(--sea-ink-soft)]">
					Upload your lecture notes, textbooks, or slides. A smart OCR
					reviewer now keeps digital text pages cheap, routes clean
					printed scans to an open-source OCR backend, and keeps
					formula-heavy or messy pages on Mistral where accuracy matters.
				</p>

				{/* Pipeline badges */}
				<div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
					{[
						"📄 OCR",
						"🔀 Chunking",
						"🧠 Embeddings",
						"🗄️ Qdrant",
						"🏗️ Skeleton",
						"✍️ Content",
						"✏️ Exercises",
					].map((step, i, arr) => (
						<span key={step} className="flex items-center gap-1.5">
							<span className="rounded-full border border-[var(--lagoon)]/30 bg-[var(--lagoon)]/10 px-2.5 py-1 text-[var(--lagoon-deep)]">
								{step}
							</span>
							{i < arr.length - 1 && (
								<span className="text-[var(--sea-ink-soft)]">
									→
								</span>
							)}
						</span>
					))}
				</div>
			</div>

			<div className="rise-in [animation-delay:100ms]">
				{isClerkEnabled ? (
					<>
						<SignedIn>
							<CourseUpload />
						</SignedIn>
						<SignedOut>
							<div className="island-shell rounded-2xl p-8 text-center">
								<h2 className="text-xl font-bold text-[var(--sea-ink)]">
									Sign in to generate private courses
								</h2>
								<p className="mt-3 text-sm text-[var(--sea-ink-soft)]">
									Course generation will become user-owned
									infrastructure for your courses, labs,
									themes, and gallery assets. Start with an
									account so generated content can be attached
									to your profile.
								</p>
								<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
									<SignInButton>
										<button className="rounded-full border border-[var(--line)] bg-white/70 px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] transition-colors hover:bg-white">
											Sign in
										</button>
									</SignInButton>
									<SignUpButton>
										<button className="rounded-full bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm">
											Create account
										</button>
									</SignUpButton>
								</div>
							</div>
						</SignedOut>
					</>
				) : (
					<CourseUpload />
				)}
			</div>
		</main>
	);
}
