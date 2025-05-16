import { corsHeaders, handleCors } from "@shared/cors.index";
import {
  handleError,
  handleValidationError,
} from "@shared/error-handler.index";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get PICA environment variables
    const picaSecretKey = Deno.env.get("PICA_SECRET_KEY");
    const picaConnectionKey = Deno.env.get("PICA_STRIPE_CONNECTION_KEY");

    if (!picaSecretKey || !picaConnectionKey) {
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

    const { paymentIntentId, cancellation_reason } = requestData;

    // Validate required parameters
    if (!paymentIntentId) {
      return handleValidationError(
        "Missing required parameter: paymentIntentId",
      );
    }

    // Validate payment intent ID format (basic check)
    if (
      typeof paymentIntentId !== "string" ||
      !paymentIntentId.startsWith("pi_")
    ) {
      return handleValidationError("Invalid payment intent ID format");
    }

    // Prepare request for canceling payment intent
    const formData = new URLSearchParams();

    if (cancellation_reason) {
      formData.append("cancellation_reason", cancellation_reason);
    }

    // Call PICA API to cancel payment intent
    let response;
    try {
      response = await fetch(
        `https://api.picaos.com/v1/passthrough/payment_intents/${encodeURIComponent(paymentIntentId)}/cancel`,
        {
          method: "POST",
          headers: {
            "x-pica-secret": picaSecretKey,
            "x-pica-connection-key": picaConnectionKey,
            "x-pica-action-id":
              "conn_mod_def::GCmLQS4UamM::jfaFq3gOS5KTpn9wv1_O_A",
            "Content-Type": "application/x-www-form-urlencoded",
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
          message: "Failed to cancel payment intent through PICA API",
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
    let paymentIntent;
    try {
      paymentIntent = await response.json();
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

    return new Response(
      JSON.stringify({
        id: paymentIntent.id,
        status: paymentIntent.status,
        canceled_at: paymentIntent.canceled_at,
        cancellation_reason: paymentIntent.cancellation_reason,
        success: paymentIntent.status === "canceled",
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
