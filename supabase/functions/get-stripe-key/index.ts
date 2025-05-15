import { corsHeaders } from "@shared/cors.ts";
import { stripeConfig, validateStripeConfig } from "@shared/stripe-config.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Validate Stripe configuration with enhanced error handling
    if (!validateStripeConfig()) {
      // Collect detailed diagnostic information
      const diagnosticInfo = {
        hasSecretKey: !!stripeConfig.secretKey,
        secretKeyPrefix: stripeConfig.secretKey
          ? stripeConfig.secretKey.substring(0, 3) + "..."
          : "missing",
        hasPublishableKey: !!stripeConfig.publishableKey,
        publishableKeyPrefix: stripeConfig.publishableKey
          ? stripeConfig.publishableKey.substring(0, 3) + "..."
          : "missing",
        environment: Deno.env.get("DENO_ENV") || "unknown",
        timestamp: new Date().toISOString(),
      };

      console.error(
        "Stripe configuration validation failed with diagnostics:",
        diagnosticInfo,
      );

      return new Response(
        JSON.stringify({
          error: "Stripe configuration is invalid or missing",
          timestamp: diagnosticInfo.timestamp,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // Return the publishable key
    return new Response(
      JSON.stringify({
        publishableKey: stripeConfig.publishableKey,
        source: "supabase-environment",
        isMockMode: stripeConfig.publishableKey.includes("test"),
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error retrieving Stripe key:", errorMessage);

    // Log additional diagnostic information
    console.error("Environment check:", {
      hasSecretKey: !!stripeConfig.secretKey,
      hasPublishableKey: !!stripeConfig.publishableKey,
      publishableKeyFormat: stripeConfig.publishableKey
        ? stripeConfig.publishableKey.startsWith("pk_")
          ? "valid"
          : "invalid"
        : "missing",
      errorStack:
        error instanceof Error ? error.stack : "No stack trace available",
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        error: "Failed to retrieve Stripe publishable key",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
