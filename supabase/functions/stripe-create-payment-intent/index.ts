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

    const { amount, currency, description, receipt_email, metadata } =
      requestData;

    // Validate required parameters
    if (!amount || !currency) {
      return handleValidationError(
        "Missing required parameters: amount and currency",
      );
    }

    // Validate amount (must be a positive integer)
    if (
      typeof amount !== "number" ||
      amount <= 0 ||
      !Number.isInteger(amount)
    ) {
      return handleValidationError(
        "Invalid amount: must be a positive integer",
      );
    }

    // Validate currency (must be a 3-letter ISO code)
    if (typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency)) {
      return handleValidationError(
        "Invalid currency: must be a 3-letter ISO currency code",
      );
    }

    // Prepare form data for creating payment intent
    const params = new URLSearchParams();
    params.append("amount", amount.toString());
    params.append("currency", currency);

    // Add optional parameters
    if (description) {
      params.append("description", description);
    }

    if (receipt_email) {
      params.append("receipt_email", receipt_email);
    }

    // Add metadata if provided
    if (metadata && typeof metadata === "object") {
      Object.entries(metadata).forEach(([key, value]) => {
        params.append(`metadata[${key}]`, value as string);
      });
    }

    // Call PICA API to create payment intent
    let response;
    try {
      response = await fetch(
        "https://api.picaos.com/v1/passthrough/payment_intents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-pica-secret": picaSecretKey,
            "x-pica-connection-key": picaConnectionKey,
            "x-pica-action-id":
              "conn_mod_def::GCmLQS4UamM::jfaFq3gOS5KTpn9wv1_O_A",
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
          message: "Failed to create payment intent through PICA API",
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
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
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
