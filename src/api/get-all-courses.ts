import { createServerFn } from "@tanstack/react-start";
import { courses as hardcodedCourses } from "#/data/timetable";
import { getAllGeneratedCourses } from "#/lib/generated-course-store";
import type { Course } from "#/data/timetable";

export const getAllCoursesList = createServerFn({ method: "POST" }).handler(
	async (): Promise<Course[]> => {
		const generated = await getAllGeneratedCourses();
		const generatedMetas: Course[] = generated.map((b) => b.meta);
		return [...hardcodedCourses, ...generatedMetas];
	}
);
