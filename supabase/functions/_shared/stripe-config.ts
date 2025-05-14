// Centralized configuration for Stripe API integration
import { corsHeaders } from "./cors.ts";

// Get environment variables for Stripe integration
export const stripeConfig = {
  secretKey: Deno.env.get("STRIPE_SECRET_KEY") || "",
  publishableKey: Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "",
  webhookSecret: Deno.env.get("STRIPE_WEBHOOK_SECRET") || "",
};

// Validate required configuration
export function validateStripeConfig(): boolean {
  if (!stripeConfig.secretKey) {
    console.error("Missing STRIPE_SECRET_KEY environment variable");
    return false;
  }

  if (!stripeConfig.publishableKey) {
    console.error("Missing STRIPE_PUBLISHABLE_KEY environment variable");
    return false;
  }

  // Check publishable key format if present
  if (
    stripeConfig.publishableKey &&
    !stripeConfig.publishableKey.startsWith("pk_")
  ) {
    console.error(
      "Invalid STRIPE_PUBLISHABLE_KEY format - must start with 'pk_'",
    );
    return false;
  }

  // Log success for debugging
  console.log("Stripe configuration validated successfully");
  return true;
}

// Validate webhook configuration
export function validateWebhookConfig(): boolean {
  if (!stripeConfig.webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
    return false;
  }

  return true;
}

// Handle CORS preflight requests for Stripe API
export function handleStripeCorsRequest(): Response {
  return new Response("ok", { headers: corsHeaders, status: 200 });
}
