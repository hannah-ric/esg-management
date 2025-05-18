import { corsHeaders, handleCors } from "@shared/cors";
import { handleError, handleValidationError } from "@shared/error-handler";
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
    if (!picaSecretKey || !picaStripeConnectionKey) {
      return handleError(
        {
          message: "PICA configuration is invalid or missing",
          code: "CONFIG_ERROR",
        },
        500,
      );
    }

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      return handleValidationError("Invalid JSON in request body");
    }

    const { subscriptionId, ...cancelOptions } = requestData;

    // Validate required parameters
    if (!subscriptionId) {
      return handleValidationError(
        "Missing required parameter: subscriptionId",
      );
    }

    // Validate subscription ID format (basic check)
    if (
      typeof subscriptionId !== "string" ||
      !subscriptionId.startsWith("sub_")
    ) {
      return handleValidationError("Invalid subscription ID format");
    }

    // Prepare form data for cancellation options
    const formData = new URLSearchParams();

    // Add optional cancellation parameters
    if (cancelOptions.invoice_now !== undefined) {
      formData.append(
        "invoice_now",
        cancelOptions.invoice_now ? "true" : "false",
      );
    }

    if (cancelOptions.prorate !== undefined) {
      formData.append("prorate", cancelOptions.prorate ? "true" : "false");
    }

    if (cancelOptions.cancellation_details?.comment) {
      formData.append(
        "cancellation_details[comment]",
        cancelOptions.cancellation_details.comment,
      );
    }

    if (cancelOptions.cancellation_details?.feedback) {
      formData.append(
        "cancellation_details[feedback]",
        cancelOptions.cancellation_details.feedback,
      );
    }

    // Call PICA API to cancel subscription
    let response;
    try {
      response = await fetch(
        `https://api.picaos.com/v1/passthrough/subscriptions/${encodeURIComponent(subscriptionId)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-pica-secret": picaSecretKey,
            "x-pica-connection-key": picaStripeConnectionKey,
            "x-pica-action-id":
              "conn_mod_def::GCmLJuvsIqw::qCRnEtxAR3ivKx1u05c7QQ",
          },
          body: formData,
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
          message: "Failed to cancel subscription through PICA API",
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

    // Update subscription in database if we have Supabase credentials
    if (supabaseUrl && supabaseServiceKey && subscription.id) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq("subscription_id", subscription.id);
      } catch (dbError) {
        console.error("Error updating subscription in database:", dbError);
        // Continue execution even if database update fails
      }
    }

    return new Response(
      JSON.stringify({
        id: subscription.id,
        status: subscription.status,
        canceled_at: subscription.canceled_at,
        cancel_at_period_end: subscription.cancel_at_period_end,
        success:
          subscription.status === "canceled" ||
          subscription.cancel_at_period_end,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return handleError(error);
  }
});
