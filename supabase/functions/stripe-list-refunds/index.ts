// import { Stripe } from "https://esm.sh/stripe@10.17.0?target=deno"; // Unused
import { corsHeaders } from "@shared/cors.ts";
// import { handleError } from "@shared/error-handler.ts"; // Unused
// import { handleValidationError } from "@shared/validation.ts"; // Unused
// import { StripeRefund } from "@shared/stripe-types.ts"; // Unused

Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
    const PICA_STRIPE_CONNECTION_KEY = Deno.env.get(
      "PICA_STRIPE_CONNECTION_KEY",
    );

    if (!PICA_SECRET_KEY || !PICA_STRIPE_CONNECTION_KEY) {
      throw new Error("Missing required environment variables");
    }

    // Parse request body
    const requestData = await req.json();

    // Prepare query parameters
    const queryParams = {};
    if (requestData.payment_intent) {
      queryParams.payment_intent = requestData.payment_intent;
    }
    if (requestData.limit) {
      queryParams.limit = requestData.limit;
    }

    // Construct URL with query parameters
    const url = new URL("https://api.picaos.com/v1/passthrough/v1/refunds");
    if (Object.keys(queryParams).length > 0) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    // Make request to Stripe via Pica
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-pica-secret": PICA_SECRET_KEY,
        "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY,
        "x-pica-action-id": "conn_mod_def::GCmLQ0ftzDc::u-8xXn-8T_uxtzMR6k3Ytg",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Stripe API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error listing refunds:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
