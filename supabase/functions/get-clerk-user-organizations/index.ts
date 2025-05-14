import { corsHeaders } from "@shared/cors.ts";

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

  try {
    const {
      userId,
      limit = 10,
      offset = 0,
    } = (await req.json()) as GetUserOrganizationsRequest;

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get user organizations from Clerk via Pica passthrough
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/v1/users/${userId}/organization_memberships?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
          "x-pica-connection-key":
            Deno.env.get("PICA_CLERK_CONNECTION_KEY") || "",
          "x-pica-action-id":
            "conn_mod_def::GCT_3sOGV5Q::soU7hp17QSCSn7k5vIgHVQ",
        },
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
