import { corsHeaders } from "@shared/cors.index";
import { handleError } from "@shared/error-handler.index";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const STRIPE_PUBLISHABLE_KEY = Deno.env.get("STRIPE_PUBLISHABLE_KEY") || Deno.env.get("STRIPE_PUBLIC_KEY");

    if (!STRIPE_PUBLISHABLE_KEY) {
      throw new Error("Stripe publishable key not found");
    }

    return new Response(
      JSON.stringify({
        publishableKey: STRIPE_PUBLISHABLE_KEY,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return handleError(error, "Error retrieving Stripe public key");
  }
});
