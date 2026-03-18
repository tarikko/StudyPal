import { ClerkProvider } from "@clerk/tanstack-react-start";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";

export const isClerkEnabled = clerkPublishableKey.trim().length > 0;

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
	if (!isClerkEnabled) {
		return <>{children}</>;
	}

	return (
		<ClerkProvider
			publishableKey={clerkPublishableKey}
			signInFallbackRedirectUrl="/"
			signUpFallbackRedirectUrl="/"
			afterSignOutUrl="/"
		>
			{children}
		</ClerkProvider>
	);
}
