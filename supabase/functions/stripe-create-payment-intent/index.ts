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
    const requestData = await req.json();

    // Prepare form data for PICA API
    const formData = new FormData();
    formData.append("amount", requestData.amount.toString());
    formData.append("currency", requestData.currency);

    if (requestData.description) {
      formData.append("description", requestData.description);
    }

    if (requestData.receipt_email) {
      formData.append("receipt_email", requestData.receipt_email);
    }

    if (requestData.metadata) {
      Object.entries(requestData.metadata).forEach(([key, value]) => {
        formData.append(`metadata[${key}]`, value as string);
      });
    }

    // Add automatic payment methods
    formData.append("automatic_payment_methods[enabled]", "true");

    // Call PICA API
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/payment_intents",
      {
        method: "POST",
        headers: {
          "x-pica-secret": picaSecretKey,
          "x-pica-connection-key": picaConnectionKey,
          "x-pica-action-id":
            "conn_mod_def::GCmOAuPP5MQ::O0MeKcobRza5lZQrIkoqBA",
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PICA API error:", response.status, errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to create payment intent through PICA API",
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
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
        status: paymentIntent.status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating payment intent:", errorMessage);

    return new Response(
      JSON.stringify({
        error: "Failed to create payment intent",
        details: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
