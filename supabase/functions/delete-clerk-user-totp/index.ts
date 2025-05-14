import { corsHeaders } from "@shared/cors.ts";
import { handleError, handleValidationError } from "@shared/error-handler.ts";
import { getClerkHeaders, validateClerkConfig } from "@shared/clerk-config.ts";

interface DeleteUserTotpRequest {
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
    const { userId } = (await req.json()) as DeleteUserTotpRequest;

    if (!userId) {
      return handleValidationError("User ID is required");
    }

    // Delete user TOTP in Clerk via Pica passthrough
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/users/${userId}/totp`,
      {
        method: "DELETE",
        headers: getClerkHeaders(
          "conn_mod_def::GCT_3LL_OUE::0LRH_VdWTHeSy4wSp95VXA",
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
    console.error("Error deleting user TOTP:", error);
    return handleError(error);
  }
});
