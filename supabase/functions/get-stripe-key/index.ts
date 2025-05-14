import { corsHeaders } from "@shared/cors.ts";
import { stripeConfig, validateStripeConfig } from "@shared/stripe-config.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Validate Stripe configuration
    if (!validateStripeConfig()) {
      return new Response(
        JSON.stringify({
          error: "Stripe configuration is invalid or missing",
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
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error retrieving Stripe key:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to retrieve Stripe publishable key",
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
