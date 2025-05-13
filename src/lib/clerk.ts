import { createClerkClient } from "@clerk/clerk-sdk-node";

// Initialize the Clerk Node SDK client
export const clerkClient = createClerkClient({
  secretKey: import.meta.env.VITE_CLERK_SECRET_KEY,
});
