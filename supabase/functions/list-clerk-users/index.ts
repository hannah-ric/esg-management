import { corsHeaders } from "@shared/cors.ts";
import { handleError } from "@shared/error-handler.ts";
import { getClerkHeaders, validateClerkConfig } from "@shared/clerk-config.ts";

interface ListUsersRequest {
  limit?: number;
  offset?: number;
  query?: string;
  emailAddressQuery?: string;
  phoneNumberQuery?: string;
  usernameQuery?: string;
  nameQuery?: string;
  banned?: boolean;
  orderBy?: string;
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
      limit = 10,
      offset = 0,
      query,
      emailAddressQuery,
      phoneNumberQuery,
      usernameQuery,
      nameQuery,
      banned,
      orderBy,
    } = (await req.json()) as ListUsersRequest;

    // Build query parameters with validation
    const queryParams = new URLSearchParams();

    // Ensure limit is within allowed range (1-500)
    const validLimit = Math.min(Math.max(Number(limit) || 10, 1), 500);
    queryParams.append("limit", validLimit.toString());

    // Ensure offset is non-negative
    const validOffset = Math.max(Number(offset) || 0, 0);
    queryParams.append("offset", validOffset.toString());

    if (query) queryParams.append("query", query);
    if (emailAddressQuery)
      queryParams.append("email_address_query", emailAddressQuery);
    if (phoneNumberQuery)
      queryParams.append("phone_number_query", phoneNumberQuery);
    if (usernameQuery) queryParams.append("username_query", usernameQuery);
    if (nameQuery) queryParams.append("name_query", nameQuery);
    if (banned !== undefined) queryParams.append("banned", banned.toString());
    if (orderBy) queryParams.append("order_by", orderBy);

    // List users from Clerk via Pica passthrough
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/users?${queryParams.toString()}`,
      {
        method: "GET",
        headers: getClerkHeaders(
          "conn_mod_def::GCT_3jssiuE::29aDwR0jRu6v1GwufLSEUg",
        ),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Clerk API error: ${JSON.stringify(errorData)}`);
    }

    const users = await response.json();

    return new Response(JSON.stringify({ users }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error listing users:", error);
    return handleError(error);
  }
});
