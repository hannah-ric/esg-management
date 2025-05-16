import { corsHeaders, handleCors } from "@shared/cors.index";
import {
  handleError,
  handleValidationError,
} from "@shared/error-handler.index";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";
const picaSecretKey = Deno.env.get("PICA_SECRET_KEY") || "";
const picaStripeConnectionKey =
  Deno.env.get("PICA_STRIPE_CONNECTION_KEY") || "";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return handleError(
        {
          message: "Missing Supabase environment variables",
          code: "CONFIG_ERROR",
        },
        500,
      );
    }

    if (!picaSecretKey || !picaStripeConnectionKey) {
      return handleError(
        { message: "Missing Pica environment variables", code: "CONFIG_ERROR" },
        500,
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      return handleValidationError("Invalid JSON in request body");
    }

    const { customerId, priceId, metadata, trialPeriodDays } = requestData;

    if (!customerId || !priceId) {
      return handleValidationError(
        "Missing required parameters: customerId and priceId",
      );
    }

    // Prepare form data for Stripe API
    const params = new URLSearchParams();
    params.append("customer", customerId);
    params.append("items[0][price]", priceId);

    // Add optional parameters
    if (trialPeriodDays) {
      params.append("trial_period_days", trialPeriodDays.toString());
    }

    // Add metadata if provided
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        params.append(`metadata[${key}]`, value as string);
      });
    }

    // Call Stripe API via Pica passthrough
    let response;
    try {
      response = await fetch(
        "https://api.picaos.com/v1/passthrough/subscriptions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-pica-secret": picaSecretKey,
            "x-pica-connection-key": picaStripeConnectionKey,
            "x-pica-action-id":
              "conn_mod_def::GCmLLKb3SYA::G12brmc7RrivZndckTk7rQ",
          },
          body: params,
        },
      );
    } catch (fetchError) {
      console.error("Network error calling PICA API:", fetchError);
      return handleError(
        {
          message: "Network error when calling PICA API",
          code: "NETWORK_ERROR",
          details: { error: fetchError.message },
        },
        503,
      );
    }

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = "Could not read error response";
      }

      console.error("PICA API error:", response.status, errorText);
      return handleError(
        {
          message: "Failed to create subscription through PICA API",
          code: "PICA_API_ERROR",
          details: {
            status: response.status,
            response: errorText,
          },
        },
        response.status,
      );
    }

    // Parse and return the response
    let subscription;
    try {
      subscription = await response.json();
    } catch (parseError) {
      console.error("Error parsing PICA API response:", parseError);
      return handleError(
        {
          message: "Invalid response from PICA API",
          code: "INVALID_RESPONSE",
        },
        500,
      );
    }

    // Store subscription in database
    if (metadata?.user_id) {
      const { error } = await supabase.from("subscriptions").insert({
        subscription_id: subscription.id,
        customer_id: subscription.customer,
        user_id: metadata.user_id,
        status: subscription.status,
        current_period_start: new Date(
          subscription.current_period_start * 1000,
        ).toISOString(),
        current_period_end: new Date(
          subscription.current_period_end * 1000,
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        plan_id: subscription.items.data[0]?.price.id,
        quantity: subscription.items.data[0]?.quantity,
        metadata: subscription.metadata,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error storing subscription:", error);
        // Continue execution even if database storage fails
      } else {
        // Update user subscription status
        await supabase
          .from("users")
          .update({ subscription_status: subscription.status })
          .eq("id", metadata.user_id);
      }
    }

    return new Response(JSON.stringify(subscription), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return handleError(error);
  }
});
