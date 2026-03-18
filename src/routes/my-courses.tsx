import { createFileRoute } from "@tanstack/react-router";
import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
} from "@clerk/tanstack-react-start";
import { courses as hardcodedCourses } from "#/data/timetable";
import { getAllCoursesList } from "#/api/get-all-courses";
import { getCourseData } from "#/api/get-course-data";
import { CourseCard } from "#/components/CourseCard";
import type { CourseContent } from "#/data/courses";
import { isClerkEnabled } from "#/lib/auth";

export const Route = createFileRoute("/my-courses")({
	loader: async () => {
		const allCourses = await getAllCoursesList();
		const generatedCourses = allCourses.filter(
			(course) =>
				!hardcodedCourses.find(
					(hardcoded) => hardcoded.id === course.id
				)
		);

		const contents = await Promise.all(
			generatedCourses.map((course) => getCourseData({ data: course.id }))
		);

		const generatedContentMap: Record<string, CourseContent> = {};
		generatedCourses.forEach((course, index) => {
			const content = contents[index];
			if (content) {
				generatedContentMap[course.id] = content;
			}
		});

		return { generatedCourses, generatedContentMap };
	},
	component: MyCoursesPage,
});

function MyCoursesPage() {
	const { generatedCourses, generatedContentMap } = Route.useLoaderData();

	return (
		<main className="page-wrap px-4 pb-8 pt-14">
			<section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10 sm:py-10">
				<p className="island-kicker mb-2">Owned Workspace</p>
				<h1 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
					My Generated Courses
				</h1>
				<p className="mt-3 max-w-2xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
					This is the private layer of StudyPal. Anything you generate
					through the upload pipeline is attached to your account when
					Clerk is enabled.
				</p>
			</section>

			<section className="mt-8 rise-in [animation-delay:120ms]">
				{isClerkEnabled ? (
					<>
						<SignedIn>
							{generatedCourses.length > 0 ? (
								<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
									{generatedCourses.map((course) => (
										<CourseCard
											key={course.id}
											course={course}
											content={
												generatedContentMap[course.id]
											}
										/>
									))}
								</div>
							) : (
								<div className="island-shell rounded-2xl p-8 text-center">
									<h2 className="text-xl font-bold text-[var(--sea-ink)]">
										No generated courses yet
									</h2>
									<p className="mt-3 text-sm text-[var(--sea-ink-soft)]">
										Upload your own course material to
										create your first private course
										workspace.
									</p>
								</div>
							)}
						</SignedIn>

						<SignedOut>
							<div className="island-shell rounded-2xl p-8 text-center">
								<h2 className="text-xl font-bold text-[var(--sea-ink)]">
									Sign in to access your private courses
								</h2>
								<p className="mt-3 text-sm text-[var(--sea-ink-soft)]">
									Generated courses are user-owned when Clerk
									is enabled, so this view only opens for
									authenticated users.
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
				) : generatedCourses.length > 0 ? (
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{generatedCourses.map((course) => (
							<CourseCard
								key={course.id}
								course={course}
								content={generatedContentMap[course.id]}
							/>
						))}
					</div>
				) : (
					<div className="island-shell rounded-2xl p-8 text-center">
						<h2 className="text-xl font-bold text-[var(--sea-ink)]">
							No generated courses yet
						</h2>
						<p className="mt-3 text-sm text-[var(--sea-ink-soft)]">
							Upload your own course material to create your first
							generated course.
						</p>
					</div>
				)}
			</section>
		</main>
	);
}
