import { corsHeaders } from "@shared/cors.ts";
import { handleError, handleValidationError } from "@shared/error-handler.ts";
import { getClerkHeaders, validateClerkConfig } from "@shared/clerk-config.ts";

interface VerifyPasswordRequest {
  userId: string;
  password: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  // Validate Clerk configuration
  if (!validateClerkConfig()) {
    return handleError("Clerk API configuration is incomplete", 500);
  }

  try {
    const { userId, password } = (await req.json()) as VerifyPasswordRequest;

    if (!userId) {
      return handleValidationError("User ID is required");
    }

    if (!password) {
      return handleValidationError("Password is required");
    }

    // Verify password with Clerk via Pica passthrough
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/users/${userId}/verify_password`,
      {
        method: "POST",
        headers: getClerkHeaders(
          "conn_mod_def::GCT_3JaML5I::xhcjHY6_QxeFSeGNHBABOw",
        ),
        body: JSON.stringify({ password }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Clerk API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify({ verified: result.verified }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error verifying password:", error);
    return handleError(error);
  }
});
