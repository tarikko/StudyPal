import { kv } from "@vercel/kv";
import type { CourseContent } from "#/data/courses";
import type { Course } from "#/data/timetable";
import { canAccessOwnedResource } from "#/lib/auth-server";

const KEY_PREFIX = "course:";

export interface GeneratedCourseBundle {
	ownerUserId?: string | null;
	createdAt?: string;
	meta: Course;
	content: CourseContent;
}

export async function saveGeneratedCourse(
	bundle: GeneratedCourseBundle
): Promise<void> {
	await kv.set(`${KEY_PREFIX}${bundle.content.courseId}`, {
		...bundle,
		createdAt: bundle.createdAt ?? new Date().toISOString(),
	});
}

export async function getGeneratedCourse(
	courseId: string,
	viewerUserId?: string | null
): Promise<GeneratedCourseBundle | null> {
	const bundle = await kv.get<GeneratedCourseBundle>(
		`${KEY_PREFIX}${courseId}`
	);
	if (!bundle) return null;
	return canAccessOwnedResource(bundle.ownerUserId, viewerUserId ?? null)
		? bundle
		: null;
}

export async function getAllGeneratedCourses(): Promise<
	GeneratedCourseBundle[]
> {
	return getAllGeneratedCoursesForUser(null);
}

export async function getAllGeneratedCoursesForUser(
	viewerUserId: string | null
): Promise<GeneratedCourseBundle[]> {
	const keys = await kv.keys(`${KEY_PREFIX}*`);
	if (keys.length === 0) return [];
	const results = await Promise.all(
		keys.map((key) => kv.get<GeneratedCourseBundle>(key))
	);
	return results
		.filter((r): r is GeneratedCourseBundle => r !== null)
		.filter((bundle) =>
			canAccessOwnedResource(bundle.ownerUserId, viewerUserId)
		)
		.sort((left, right) => {
			const leftTime = new Date(left.createdAt ?? 0).getTime();
			const rightTime = new Date(right.createdAt ?? 0).getTime();
			return rightTime - leftTime;
		});
}

/** Append newly generated exercises to an existing course bundle in KV. */
export async function appendExercises(
	courseId: string,
	newExercises: import("#/data/courses").Exercise[],
	viewerUserId?: string | null
): Promise<void> {
	const key = `${KEY_PREFIX}${courseId}`;
	const existing = await kv.get<GeneratedCourseBundle>(key);
	if (!existing) throw new Error(`Course ${courseId} not found in store`);
	if (!canAccessOwnedResource(existing.ownerUserId, viewerUserId ?? null)) {
		throw new Error(`Course ${courseId} is not accessible to this user`);
	}
	const updated: GeneratedCourseBundle = {
		...existing,
		content: {
			...existing.content,
			exercises: [...existing.content.exercises, ...newExercises],
		},
	};
	await kv.set(key, updated);
}
