import { corsHeaders } from "@shared/cors.ts";

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

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append("limit", limit.toString());
    if (offset) queryParams.append("offset", offset.toString());
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
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
          "x-pica-connection-key":
            Deno.env.get("PICA_CLERK_CONNECTION_KEY") || "",
          "x-pica-action-id":
            "conn_mod_def::GCT_3jssiuE::29aDwR0jRu6v1GwufLSEUg",
        },
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
