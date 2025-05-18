import { corsHeaders } from "@shared/cors.index";
import { SubscriptionCreateParams } from "@shared/stripe-types.index";
import { handleError } from "@shared/error-handler.index";
import { validateRequiredFields } from "@shared/validation.index";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
const PICA_STRIPE_CONNECTION_KEY = Deno.env.get("PICA_STRIPE_CONNECTION_KEY");

interface CreateSubscriptionRequest {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const params = (await req.json()) as CreateSubscriptionRequest;

    // Validate required fields
    const validationError = validateRequiredFields(params, [
      "customerId",
      "priceId",
    ]);

    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Prepare URL parameters
    const urlParams = new URLSearchParams();
    urlParams.append("customer", params.customerId);
    urlParams.append("items[0][price]", params.priceId);

    // Add trial period days if provided
    if (params.trialPeriodDays) {
      urlParams.append("trial_period_days", params.trialPeriodDays.toString());
    }

    // Add metadata if provided
    if (params.metadata) {
      Object.entries(params.metadata).forEach(([key, value]) => {
        urlParams.append(`metadata[${key}]`, value);
      });
    }

    // Make request to Pica API
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/subscriptions",
      {
        method: "POST",
        headers: {
          "x-pica-secret": PICA_SECRET_KEY || "",
          "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY || "",
          "x-pica-action-id":
            "conn_mod_def::GCmLLKb3SYA::G12brmc7RrivZndckTk7rQ",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlParams.toString(),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.error || "Failed to create subscription",
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
