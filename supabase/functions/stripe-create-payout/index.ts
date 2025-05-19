import { corsHeaders } from "@shared/cors";
import { handleError } from "@shared/error-handler";
import { validateRequiredFields } from "@shared/validation";

const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
const PICA_STRIPE_CONNECTION_KEY = Deno.env.get("PICA_STRIPE_CONNECTION_KEY");

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, currency, destination, description, metadata } =
      await req.json();

    // Validate required fields
    const validationError = validateRequiredFields(
      { amount, currency, destination },
      ["amount", "currency", "destination"],
    );

    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Prepare URL parameters
    const urlParams = new URLSearchParams();
    urlParams.append("amount", amount.toString());
    urlParams.append("currency", currency);
    urlParams.append("destination", destination);

    if (description) urlParams.append("description", description);

    // Add metadata if provided
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        urlParams.append(`metadata[${key}]`, value);
      });
    }

    // Make request to Pica API
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/payouts",
      {
        method: "POST",
        headers: {
          "x-pica-secret": PICA_SECRET_KEY || "",
          "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY || "",
          "x-pica-action-id": "conn_mod_def::GCmOAuPP5MQ::payout_action_id", // Replace with actual action ID
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlParams.toString(),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.error || "Failed to create payout",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status,
        },
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return handleError(error);
  }
});
