import { corsHeaders } from "@shared/cors.ts";

interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { firstName, lastName, email, password, companyName } =
      (await req.json()) as CreateUserRequest;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Create user in Clerk via Pica passthrough
    const userData = {
      email_address: [email],
      password,
      first_name: firstName,
      last_name: lastName,
      public_metadata: {
        company_name: companyName || "",
      },
      skip_password_checks: false,
      skip_password_requirement: false,
    };

    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
          "x-pica-connection-key":
            Deno.env.get("PICA_CLERK_CONNECTION_KEY") || "",
          "x-pica-action-id":
            "conn_mod_def::GCT_4OlUshg::VU_wKTJ7RbCaeYvjHd4Izw",
        },
        body: JSON.stringify(userData),
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
    console.error("Error creating user:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
