import { createStart } from "@tanstack/react-start";
import { clerkMiddleware } from "@clerk/tanstack-react-start/server";

const isClerkServerEnabled = Boolean(
	process.env.CLERK_SECRET_KEY?.trim() &&
	(process.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ||
		process.env.CLERK_PUBLISHABLE_KEY?.trim())
);

export const startInstance = createStart(() => {
	return {
		requestMiddleware: isClerkServerEnabled ? [clerkMiddleware()] : [],
	};
});
