import { createServerFn } from "@tanstack/react-start";
import { courseContents } from "#/data/courses";
import { getGeneratedCourse } from "#/lib/generated-course-store";
import { getViewerUserId } from "#/lib/auth-server";
import type { CourseContent } from "#/data/courses";

export const getCourseData = createServerFn({ method: "POST" })
	.inputValidator((courseId: string) => courseId)
	.handler(async ({ data: courseId }): Promise<CourseContent | null> => {
		// Check hardcoded first
		if (courseContents[courseId]) return courseContents[courseId];
		// Fall back to generated
		const viewerUserId = await getViewerUserId();
		const bundle = await getGeneratedCourse(courseId, viewerUserId);
		return bundle?.content ?? null;
	});
