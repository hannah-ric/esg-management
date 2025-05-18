import { corsHeaders } from "@shared/cors.index";
import { PaymentIntentCreateParams } from "@shared/stripe-types.index";
import { handleError } from "@shared/error-handler.index";
import { validateRequiredFields } from "@shared/validation";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
const PICA_STRIPE_CONNECTION_KEY = Deno.env.get("PICA_STRIPE_CONNECTION_KEY");

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const params = (await req.json()) as PaymentIntentCreateParams;

    // Validate required fields
    const validationError = validateRequiredFields(params, [
      "amount",
      "currency",
    ]);
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Prepare URL parameters
    const urlParams = new URLSearchParams();
    urlParams.append("amount", params.amount.toString());
    urlParams.append("currency", params.currency);

    // Add optional parameters if provided
    if (params.description) urlParams.append("description", params.description);
    if (params.receipt_email)
      urlParams.append("receipt_email", params.receipt_email);
    if (params.customer) urlParams.append("customer", params.customer);

    // Add automatic payment methods
    urlParams.append("automatic_payment_methods[enabled]", "true");

    // Add metadata if provided
    if (params.metadata) {
      Object.entries(params.metadata).forEach(([key, value]) => {
        urlParams.append(`metadata[${key}]`, value);
      });
    }

    // Make request to Pica API
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/payment_intents",
      {
        method: "POST",
        headers: {
          "x-pica-secret": PICA_SECRET_KEY || "",
          "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY || "",
          "x-pica-action-id":
            "conn_mod_def::GCmOAuPP5MQ::O0MeKcobRza5lZQrIkoqBA",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlParams.toString(),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.error || "Failed to create payment intent",
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
