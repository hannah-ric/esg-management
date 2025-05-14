import { corsHeaders, handleCors } from "@shared/cors.ts";
import qs from "https://cdn.skypack.dev/qs@6.11.0";

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
    if (!requestData.amount || !requestData.currency) {
      throw new Error(
        "Missing required fields: amount and currency are required",
      );
    }

    // Prepare form data
    const formData = {
      amount: requestData.amount,
      currency: requestData.currency,
    };

    // Add optional fields if they exist
    if (requestData.description) formData.description = requestData.description;
    if (requestData.metadata) formData.metadata = requestData.metadata;
    if (requestData.statement_descriptor)
      formData.statement_descriptor = requestData.statement_descriptor;
    if (requestData.destination) formData.destination = requestData.destination;
    if (requestData.method) formData.method = requestData.method;
    if (requestData.source_type) formData.source_type = requestData.source_type;

    // Make request to Stripe via Pica
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/v1/payouts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-pica-secret": PICA_SECRET_KEY,
          "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY,
          "x-pica-action-id":
            "conn_mod_def::GCmLQxFmO6A::09vMSElPTbuLewGRzzLhpA",
        },
        body: qs.stringify(formData),
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
    console.error("Error creating payout:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
