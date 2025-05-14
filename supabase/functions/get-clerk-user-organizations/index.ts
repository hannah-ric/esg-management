import { corsHeaders } from "@shared/cors.ts";
import { handleError, handleValidationError } from "@shared/error-handler.ts";
import { getClerkHeaders, validateClerkConfig } from "@shared/clerk-config.ts";

interface GetUserOrganizationsRequest {
  userId: string;
  limit?: number;
  offset?: number;
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
    const {
      userId,
      limit = 10,
      offset = 0,
    } = (await req.json()) as GetUserOrganizationsRequest;

    if (!userId) {
      return handleValidationError("User ID is required");
    }

    // Validate limit and offset
    const validLimit = Math.min(Math.max(Number(limit) || 10, 1), 500);
    const validOffset = Math.max(Number(offset) || 0, 0);

    // Get user organizations from Clerk via Pica passthrough
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/users/${userId}/organization_memberships?limit=${validLimit}&offset=${validOffset}`,
      {
        method: "GET",
        headers: getClerkHeaders(
          "conn_mod_def::GCT_3sOGV5Q::soU7hp17QSCSn7k5vIgHVQ",
        ),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Clerk API error: ${JSON.stringify(errorData)}`);
    }

    const organizationsData = await response.json();

    return new Response(JSON.stringify(organizationsData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error getting user organizations:", error);
    return handleError(error);
  }
});
