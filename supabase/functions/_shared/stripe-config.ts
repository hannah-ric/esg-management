// deno-lint-ignore-file
/// <reference lib="deno.ns" />
// Centralized configuration for Stripe API integration
import { corsHeaders } from "./cors.index";

// Get environment variables for Stripe integration
export const stripeConfig = {
  secretKey: Deno.env.get("STRIPE_SECRET_KEY") || "",
  publishableKey: Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "",
  webhookSecret: Deno.env.get("STRIPE_WEBHOOK_SECRET") || "",
};

// Validate required configuration with enhanced diagnostics
export function validateStripeConfig(): boolean {
  const validationIssues = [];
  const diagnosticInfo = {
    secretKeyExists: !!stripeConfig.secretKey,
    secretKeyFormat: stripeConfig.secretKey
      ? stripeConfig.secretKey.startsWith("sk_")
        ? "valid"
        : "invalid"
      : "missing",
    publishableKeyExists: !!stripeConfig.publishableKey,
    publishableKeyFormat: stripeConfig.publishableKey
      ? stripeConfig.publishableKey.startsWith("pk_")
        ? "valid"
        : "invalid"
      : "missing",
    environment: Deno.env.get("DENO_ENV") || "unknown",
  };

  if (!stripeConfig.secretKey) {
    validationIssues.push("Missing STRIPE_SECRET_KEY environment variable");
  } else if (!stripeConfig.secretKey.startsWith("sk_")) {
    validationIssues.push(
      "Invalid STRIPE_SECRET_KEY format - must start with 'sk_'",
    );
  }

  if (!stripeConfig.publishableKey) {
    validationIssues.push(
      "Missing STRIPE_PUBLISHABLE_KEY environment variable",
    );
  } else if (!stripeConfig.publishableKey.startsWith("pk_")) {
    validationIssues.push(
      "Invalid STRIPE_PUBLISHABLE_KEY format - must start with 'pk_'",
    );
  }

  // Log all validation issues with diagnostic information
  if (validationIssues.length > 0) {
    console.error("Stripe configuration validation failed:", validationIssues);
    console.error("Diagnostic information:", diagnosticInfo);
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

// Initialize Stripe client if needed
export const stripe = {
  paymentIntents: {
    create: async (params: any) => {
      // This is a placeholder - in a real implementation, you would use the Stripe SDK
      // or make direct API calls to Stripe via the Pica passthrough API
      throw new Error(
        "Stripe client not implemented - use Pica passthrough API",
      );
    },
  },
};
