import { corsHeaders } from "@shared/cors.index";
import { handleError } from "@shared/error-handler.index";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const STRIPE_PUBLIC_KEY = Deno.env.get("STRIPE_PUBLIC_KEY");

    if (!STRIPE_PUBLIC_KEY) {
      throw new Error("Stripe public key not found");
    }

    return new Response(
      JSON.stringify({
        publicKey: STRIPE_PUBLIC_KEY,
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
