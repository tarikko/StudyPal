import { kv } from "@vercel/kv";
import type { CourseContent } from "#/data/courses";
import type { Course } from "#/data/timetable";

const KEY_PREFIX = "course:";

export interface GeneratedCourseBundle {
	meta: Course;
	content: CourseContent;
}

export async function saveGeneratedCourse(
	bundle: GeneratedCourseBundle
): Promise<void> {
	await kv.set(`${KEY_PREFIX}${bundle.content.courseId}`, bundle);
}

export async function getGeneratedCourse(
	courseId: string
): Promise<GeneratedCourseBundle | null> {
	return await kv.get<GeneratedCourseBundle>(`${KEY_PREFIX}${courseId}`);
}

export async function getAllGeneratedCourses(): Promise<
	GeneratedCourseBundle[]
> {
	const keys = await kv.keys(`${KEY_PREFIX}*`);
	if (keys.length === 0) return [];
	const results = await Promise.all(
		keys.map((key) => kv.get<GeneratedCourseBundle>(key))
	);
	return results.filter((r): r is GeneratedCourseBundle => r !== null);
}
