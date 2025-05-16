import { corsHeaders, handleCors } from "@shared/cors.index.ts";

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

    // Validate required fields
    if (!requestData.id) {
      throw new Error("Missing required field: id");
    }

    // Make request to Stripe via Pica
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/refunds/${requestData.id}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-pica-secret": PICA_SECRET_KEY,
          "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY,
          "x-pica-action-id":
            "conn_mod_def::GCmLQfm5efg::o8vq6-jfRZSqpNaSmtOFkw",
        },
      },
    );

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
    console.error("Error canceling refund:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
