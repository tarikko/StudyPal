import { createServerFn } from "@tanstack/react-start";
import { courses as hardcodedCourses } from "#/data/timetable";
import { getAllGeneratedCoursesForUser } from "#/lib/generated-course-store";
import { getViewerUserId } from "#/lib/auth-server";
import type { Course } from "#/data/timetable";

export const getAllCoursesList = createServerFn({ method: "POST" }).handler(
	async (): Promise<Course[]> => {
		const viewerUserId = await getViewerUserId();
		const generated = await getAllGeneratedCoursesForUser(viewerUserId);
		const generatedMetas: Course[] = generated.map((b) => b.meta);
		return [...hardcodedCourses, ...generatedMetas];
	}
);
