import { createServerFn } from "@tanstack/react-start";
import { generateMoreExercises } from "#/lib/course-generator";
import {
	appendExercises,
	getGeneratedCourse,
} from "#/lib/generated-course-store";
import { getViewerUserId } from "#/lib/auth-server";
import type { Exercise, Chapter } from "#/data/courses";

export interface GenerateMoreExercisesInput {
	courseId: string;
	/** Pass the chapters so the function has section info for prerequisites. */
	chapters: Chapter[];
	/** All exercises already visible to the user (used to avoid duplicates). */
	existingExercises: Exercise[];
	/** Optionally restrict to one chapter. */
	targetChapterId?: string;
	/** How many new exercises to generate (default 5). */
	count?: number;
}

export const generateMoreExercisesAction = createServerFn({ method: "POST" })
	.inputValidator((input: GenerateMoreExercisesInput) => input)
	.handler(async ({ data }): Promise<Exercise[]> => {
		const {
			courseId,
			chapters,
			existingExercises,
			targetChapterId,
			count,
		} = data;
		const viewerUserId = await getViewerUserId();

		// Verify the course exists in the store before doing any heavy work
		const bundle = await getGeneratedCourse(courseId, viewerUserId);
		if (!bundle) throw new Error(`Course ${courseId} not found`);

		const newExercises = await generateMoreExercises(
			courseId,
			chapters,
			existingExercises,
			{ count: count ?? 5, targetChapterId }
		);

		if (newExercises.length > 0) {
			await appendExercises(courseId, newExercises, viewerUserId);
		}

		return newExercises;
	});
