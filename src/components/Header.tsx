import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
} from "@clerk/tanstack-react-start";
import ThemeToggle from "./ThemeToggle";
import { isClerkEnabled } from "#/lib/auth";

export default function Header() {
	const [drawerOpen, setDrawerOpen] = useState(false);

	return (
		<>
			<header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
				<nav className="page-wrap flex items-center gap-x-3 py-3 sm:py-4">
					<h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
						<Link
							to="/"
							className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
						>
							<span className="text-lg">📚</span>
							StudyPal
						</Link>
					</h2>

					{/* Desktop nav */}
					<div className="hidden items-center gap-x-4 text-sm font-semibold sm:flex">
						<Link
							to="/"
							className="nav-link"
							activeProps={{ className: "nav-link is-active" }}
							activeOptions={{ exact: true }}
						>
							Dashboard
						</Link>
						<Link
							to="/timetable"
							className="nav-link"
							activeProps={{ className: "nav-link is-active" }}
						>
							Timetable
						</Link>
						<Link
							to="/upload"
							className="nav-link"
							activeProps={{ className: "nav-link is-active" }}
						>
							Upload
						</Link>
						{isClerkEnabled && (
							<SignedIn>
								<Link
									to="/my-courses"
									className="nav-link"
									activeProps={{
										className: "nav-link is-active",
									}}
								>
									My Courses
								</Link>
							</SignedIn>
						)}
					</div>

					<div className="ml-auto flex items-center gap-1.5 sm:gap-2">
						{isClerkEnabled && (
							<div className="hidden items-center gap-2 sm:flex">
								<SignedOut>
									<SignInButton>
										<button className="rounded-full border border-[var(--line)] bg-white/60 px-3 py-2 text-xs font-semibold text-[var(--sea-ink)] transition-colors hover:bg-white/90">
											Sign in
										</button>
									</SignInButton>
									<SignUpButton>
										<button className="rounded-full bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-95">
											Sign up
										</button>
									</SignUpButton>
								</SignedOut>
								<SignedIn>
									<UserButton afterSignOutUrl="/" />
								</SignedIn>
							</div>
						)}
						<ThemeToggle />
						{/* Mobile hamburger */}
						<button
							onClick={() => setDrawerOpen(true)}
							className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] sm:hidden"
							aria-label="Open menu"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
							>
								<path d="M3 5h14M3 10h14M3 15h14" />
							</svg>
						</button>
					</div>
				</nav>
			</header>

			{/* Mobile drawer overlay */}
			{drawerOpen && (
				<div
					className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm sm:hidden"
					onClick={() => setDrawerOpen(false)}
				/>
			)}

			{/* Mobile drawer panel */}
			<div
				className={`fixed top-0 right-0 z-[101] flex h-full w-64 flex-col bg-[var(--surface-strong)] shadow-2xl transition-transform duration-300 ease-out sm:hidden ${
					drawerOpen ? "translate-x-0" : "translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
					<span className="text-sm font-bold text-[var(--sea-ink)]">
						Menu
					</span>
					<button
						onClick={() => setDrawerOpen(false)}
						className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
						aria-label="Close menu"
					>
						✕
					</button>
				</div>
				<nav className="flex flex-col gap-1 p-4">
					<Link
						to="/"
						className="rounded-lg px-4 py-3 text-sm font-semibold text-[var(--sea-ink-soft)] no-underline transition-colors hover:bg-white/60 hover:text-[var(--sea-ink)]"
						activeProps={{
							className:
								"rounded-lg px-4 py-3 text-sm font-semibold bg-[var(--lagoon)]/15 text-[var(--lagoon-deep)] no-underline",
						}}
						activeOptions={{ exact: true }}
						onClick={() => setDrawerOpen(false)}
					>
						📊 Dashboard
					</Link>
					<Link
						to="/timetable"
						className="rounded-lg px-4 py-3 text-sm font-semibold text-[var(--sea-ink-soft)] no-underline transition-colors hover:bg-white/60 hover:text-[var(--sea-ink)]"
						activeProps={{
							className:
								"rounded-lg px-4 py-3 text-sm font-semibold bg-[var(--lagoon)]/15 text-[var(--lagoon-deep)] no-underline",
						}}
						onClick={() => setDrawerOpen(false)}
					>
						📅 Timetable
					</Link>
					<Link
						to="/upload"
						className="rounded-lg px-4 py-3 text-sm font-semibold text-[var(--sea-ink-soft)] no-underline transition-colors hover:bg-white/60 hover:text-[var(--sea-ink)]"
						activeProps={{
							className:
								"rounded-lg px-4 py-3 text-sm font-semibold bg-[var(--lagoon)]/15 text-[var(--lagoon-deep)] no-underline",
						}}
						onClick={() => setDrawerOpen(false)}
					>
						📤 Upload
					</Link>

					{isClerkEnabled && (
						<SignedIn>
							<Link
								to="/my-courses"
								className="rounded-lg px-4 py-3 text-sm font-semibold text-[var(--sea-ink-soft)] no-underline transition-colors hover:bg-white/60 hover:text-[var(--sea-ink)]"
								activeProps={{
									className:
										"rounded-lg px-4 py-3 text-sm font-semibold bg-[var(--lagoon)]/15 text-[var(--lagoon-deep)] no-underline",
								}}
								onClick={() => setDrawerOpen(false)}
							>
								🗂️ My Courses
							</Link>
						</SignedIn>
					)}

					{isClerkEnabled && (
						<div className="mt-4 border-t border-[var(--line)] pt-4">
							<SignedOut>
								<div className="flex flex-col gap-2">
									<SignInButton>
										<button
											onClick={() => setDrawerOpen(false)}
											className="rounded-lg border border-[var(--line)] bg-white/60 px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition-colors hover:bg-white/90"
										>
											Sign in
										</button>
									</SignInButton>
									<SignUpButton>
										<button
											onClick={() => setDrawerOpen(false)}
											className="rounded-lg bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)] px-4 py-3 text-sm font-semibold text-white"
										>
											Create account
										</button>
									</SignUpButton>
								</div>
							</SignedOut>
							<SignedIn>
								<div className="px-4">
									<p className="mb-2 text-xs font-semibold tracking-wider text-[var(--sea-ink-soft)] uppercase">
										Account
									</p>
									<UserButton afterSignOutUrl="/" />
								</div>
							</SignedIn>
						</div>
					)}
				</nav>
			</div>
		</>
	);
}
