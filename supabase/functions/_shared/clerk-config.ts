// Centralized configuration for Clerk API integration
import { corsHeaders } from "./cors.ts";

// Get environment variables for Clerk integration
export const clerkConfig = {
  secretKey: Deno.env.get("CLERK_SECRET_KEY") || "",
  publishableKey: Deno.env.get("CLERK_PUBLISHABLE_KEY") || "",
  picaSecretKey: Deno.env.get("PICA_SECRET_KEY") || "",
  picaClerkConnectionKey: Deno.env.get("PICA_CLERK_CONNECTION_KEY") || "",
  webhookSecret: Deno.env.get("CLERK_WEBHOOK_SECRET") || "",
};

// Validate required configuration
export function validateClerkConfig(): boolean {
  // Only check for Pica keys as they're required for the passthrough
  if (!clerkConfig.picaSecretKey) {
    console.error("Missing PICA_SECRET_KEY environment variable");
    return false;
  }

  if (!clerkConfig.picaClerkConnectionKey) {
    console.error("Missing PICA_CLERK_CONNECTION_KEY environment variable");
    return false;
  }

  // Check publishable key format if present
  if (
    clerkConfig.publishableKey &&
    !clerkConfig.publishableKey.startsWith("pk_")
  ) {
    console.error(
      "Invalid CLERK_PUBLISHABLE_KEY format - must start with 'pk_'",
    );
    return false;
  }

  // Log success for debugging
  console.log("Clerk configuration validated successfully");
  return true;
}

// Validate webhook configuration
export function validateWebhookConfig(): boolean {
  if (!clerkConfig.webhookSecret) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return false;
  }

  return true;
}

// Get standard headers for Clerk API requests
export function getClerkHeaders(actionId: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-pica-secret": clerkConfig.picaSecretKey,
    "x-pica-connection-key": clerkConfig.picaClerkConnectionKey,
    "x-pica-action-id": actionId,
  };
}

// Handle CORS preflight requests for Clerk API
export function handleClerkCorsRequest(): Response {
  return new Response("ok", { headers: corsHeaders, status: 200 });
}
