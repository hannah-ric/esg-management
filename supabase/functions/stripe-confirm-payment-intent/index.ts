import { corsHeaders } from "@shared/cors";
import { PaymentIntentConfirmParams } from "@shared/stripe-types";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
const PICA_STRIPE_CONNECTION_KEY = Deno.env.get("PICA_STRIPE_CONNECTION_KEY");

interface ConfirmPaymentIntentRequest {
  payment_intent_id: string;
  payment_method?: string;
  receipt_email?: string;
  return_url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const params = (await req.json()) as ConfirmPaymentIntentRequest;

    if (!params.payment_intent_id) {
      return new Response(
        JSON.stringify({ error: "Payment intent ID is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Prepare URL parameters
    const urlParams = new URLSearchParams();

    // Add optional parameters if provided
    if (params.payment_method)
      urlParams.append("payment_method", params.payment_method);
    if (params.receipt_email)
      urlParams.append("receipt_email", params.receipt_email);
    if (params.return_url) urlParams.append("return_url", params.return_url);

    // Make request to Pica API
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/payment_intents/${params.payment_intent_id}/confirm`,
      {
        method: "POST",
        headers: {
          "x-pica-secret": PICA_SECRET_KEY || "",
          "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY || "",
          "x-pica-action-id":
            "conn_mod_def::GCmLRYqDIUI::ucwsQ4frSIWqzD2gtz2Oiw",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlParams.toString(),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.error || "Failed to confirm payment intent",
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
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
