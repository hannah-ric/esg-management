import { corsHeaders } from "@shared/cors.ts";
import { handleError, handleValidationError } from "@shared/error-handler.ts";
import { getClerkHeaders, validateClerkConfig } from "@shared/clerk-config.ts";

interface DisableUserMfaRequest {
  userId: string;
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
    const { userId } = (await req.json()) as DisableUserMfaRequest;

    if (!userId) {
      return handleValidationError("User ID is required");
    }

    // Disable user MFA in Clerk via Pica passthrough
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/users/${userId}/mfa`,
      {
        method: "DELETE",
        headers: getClerkHeaders(
          "conn_mod_def::GCT_3HyZMsU::zsfjMjV_TWySxjDzsfkV5A",
        ),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Clerk API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error disabling user MFA:", error);
    return handleError(error);
  }
});
