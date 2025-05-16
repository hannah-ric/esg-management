import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.15.0";

import { corsHeaders } from "@shared/cors.index";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  // Standard headers for all responses
  const responseHeaders = {
    ...corsHeaders,
    "Content-Type": "application/json",
    "Cache-Control": "no-store, max-age=0", // Prevent caching of sensitive data
  };

  try {
    // Retrieve Stripe keys from environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripePublishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");

    if (!stripeSecretKey || !stripePublishableKey) {
      console.error("Stripe keys not configured in environment variables");
      return new Response(
        JSON.stringify({
          error: "Stripe keys not configured",
          details: "Please check environment variables configuration",
        }),
        {
          status: 500,
          headers: responseHeaders,
        },
      );
    }

    // Initialize Stripe client
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
    });

    // Return the publishable key which is safe to expose to the client
    return new Response(
      JSON.stringify({
        publishableKey: stripePublishableKey,
        success: true,
      }),
      {
        status: 200,
        headers: responseHeaders,
      },
    );
  } catch (error) {
    console.error("Error in get-stripe-key function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal Server Error",
        success: false,
      }),
      {
        status: 500,
        headers: responseHeaders,
      },
    );
  }
});
