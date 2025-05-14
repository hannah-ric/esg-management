import { corsHeaders } from "@shared/cors.ts";

interface UpdateUserRequest {
  userId: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { userId, firstName, lastName, companyName, email } =
      (await req.json()) as UpdateUserRequest;

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Prepare update data
    const updateData: Record<string, any> = {};

    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (email !== undefined) updateData.email_address = [email];
    if (companyName !== undefined) {
      updateData.public_metadata = {
        company_name: companyName,
      };
    }

    // Update user in Clerk via Pica passthrough
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/users/${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
          "x-pica-connection-key":
            Deno.env.get("PICA_CLERK_CONNECTION_KEY") || "",
          "x-pica-action-id":
            "conn_mod_def::GCT_31Q-7fo::pym2V-IETdaZ-7BJwSQTSA",
        },
        body: JSON.stringify(updateData),
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
    console.error("Error updating user:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
