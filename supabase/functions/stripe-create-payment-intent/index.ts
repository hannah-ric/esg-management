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

    // Prepare form data for PICA API
    const formData = new FormData();

    // Validate required fields
    if (!requestData.amount || !requestData.currency) {
      return handleValidationError(
        "Missing required parameters: amount and currency are required",
      );
    }

    // Validate amount is a positive number
    const amount = Number(requestData.amount);
    if (isNaN(amount) || amount <= 0) {
      return handleValidationError("Amount must be a positive number");
    }

    formData.append("amount", amount.toString());
    formData.append("currency", requestData.currency.toLowerCase());

    if (requestData.description) {
      formData.append("description", requestData.description);
    }

    if (requestData.receipt_email) {
      formData.append("receipt_email", requestData.receipt_email);
    }

    if (requestData.metadata && typeof requestData.metadata === "object") {
      Object.entries(requestData.metadata).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`metadata[${key}]`, String(value));
        }
      });
    }

    // Add automatic payment methods
    formData.append("automatic_payment_methods[enabled]", "true");

    // Call PICA API
    let response;
    try {
      response = await fetch(
        "https://api.picaos.com/v1/passthrough/payment_intents",
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
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
        status: paymentIntent.status,
        success: true,
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
