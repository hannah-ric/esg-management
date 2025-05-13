import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get user from Clerk via Pica passthrough
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/users/${userId}`,
      {
        method: "GET",
        headers: {
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
          "x-pica-connection-key":
            Deno.env.get("PICA_CLERK_CONNECTION_KEY") || "",
          "x-pica-action-id":
            "conn_mod_def::GCT_31Q-7fo::pym2V-IETdaZ-7BJwSQTSA",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Clerk API error: ${JSON.stringify(errorData)}`);
    }

    const clerkUser = await response.json();

    return new Response(JSON.stringify({ user: clerkUser }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
