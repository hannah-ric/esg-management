import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Get PICA environment variables
    const picaSecretKey = Deno.env.get("PICA_SECRET_KEY");
    const picaConnectionKey = Deno.env.get("PICA_STRIPE_CONNECTION_KEY");

    if (!picaSecretKey || !picaConnectionKey) {
      console.error("Missing PICA environment variables");
      return new Response(
        JSON.stringify({
          error: "PICA configuration is invalid or missing",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // Parse request body
    const { paymentIntentId } = await req.json();

    // Validate required parameters
    if (!paymentIntentId) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameter: paymentIntentId",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Call PICA API to retrieve payment intent
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/payment_intents/${paymentIntentId}`,
      {
        method: "GET",
        headers: {
          "x-pica-secret": picaSecretKey,
          "x-pica-connection-key": picaConnectionKey,
          "x-pica-action-id":
            "conn_mod_def::GCmOAuPP5MQ::O0MeKcobRza5lZQrIkoqBA",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PICA API error:", response.status, errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to confirm payment intent through PICA API",
          status: response.status,
          details: errorText,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status,
        },
      );
    }

    // Parse and return the response
    const paymentIntent = await response.json();

    return new Response(
      JSON.stringify({
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        success: paymentIntent.status === "succeeded",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error confirming payment intent:", errorMessage);

    return new Response(
      JSON.stringify({
        error: "Failed to confirm payment intent",
        details: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
