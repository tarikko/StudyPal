import { auth } from "@clerk/tanstack-react-start/server";

export const isClerkServerEnabled = Boolean(
	process.env.CLERK_SECRET_KEY?.trim() &&
	(process.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ||
		process.env.CLERK_PUBLISHABLE_KEY?.trim())
);

export async function getViewerUserId(): Promise<string | null> {
	if (!isClerkServerEnabled) {
		return null;
	}

	const { userId } = await auth();
	return userId ?? null;
}

export async function requireViewerUserId(): Promise<string | null> {
	if (!isClerkServerEnabled) {
		return null;
	}

	const { userId } = await auth();
	if (!userId) {
		throw new Error("You must be signed in to access this resource.");
	}

	return userId;
}

export function canAccessOwnedResource(
	ownerUserId: string | null | undefined,
	viewerUserId: string | null
) {
	if (!ownerUserId) {
		return true;
	}

	return ownerUserId === viewerUserId;
}
