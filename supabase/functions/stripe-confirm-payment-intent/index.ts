import { corsHeaders } from "@shared/cors.ts";
import { handleError, handleValidationError } from "@shared/error-handler.ts";

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

    const { paymentIntentId, payment_method_id, return_url } = requestData;

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

    // Prepare request for confirming payment intent
    const formData = new FormData();

    if (payment_method_id) {
      formData.append("payment_method", payment_method_id);
    }

    if (return_url) {
      formData.append("return_url", return_url);
    }

    // Call PICA API to confirm payment intent
    let response;
    try {
      response = await fetch(
        `https://api.picaos.com/v1/passthrough/payment_intents/${encodeURIComponent(paymentIntentId)}/confirm`,
        {
          method: "POST",
          headers: {
            "x-pica-secret": picaSecretKey,
            "x-pica-connection-key": picaConnectionKey,
            "x-pica-action-id":
              "conn_mod_def::GCmLRYqDIUI::uzwgAbl3RFeFxdmPV_koDw",
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
          message: "Failed to confirm payment intent through PICA API",
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

    // Validate the payment intent data
    if (!paymentIntent.id || !paymentIntent.status) {
      console.error("Invalid payment intent data:", paymentIntent);
      return handleError(
        {
          message: "Invalid payment intent data received",
          code: "INVALID_DATA",
        },
        500,
      );
    }

    return new Response(
      JSON.stringify({
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        client_secret: paymentIntent.client_secret,
        next_action: paymentIntent.next_action,
        success: paymentIntent.status === "succeeded",
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
