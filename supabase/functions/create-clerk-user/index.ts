import { corsHeaders } from "@shared/cors.ts";
import { getClerkHeaders, validateClerkConfig } from "@shared/clerk-config.ts";
import { handleError, handleValidationError } from "@shared/error-handler.ts";

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

  // Validate Clerk configuration
  if (!validateClerkConfig()) {
    return handleError("Clerk API configuration is incomplete", 500);
  }

  try {
    const { firstName, lastName, email, password, companyName } =
      (await req.json()) as CreateUserRequest;

    if (!email || !password) {
      return handleValidationError("Email and password are required");
    }

    // Create user in Clerk via Pica passthrough
    const userData = {
      email_address: [email],
      password,
      first_name: firstName || "",
      last_name: lastName || "",
      public_metadata: {
        company_name: companyName || "",
      },
      skip_password_checks: false,
      skip_password_requirement: false,
      created_at: new Date().toISOString(),
      external_id: null,
      phone_number: [],
      web3_wallet: [],
      username: null,
      password_digest: "",
      password_hasher: "bcrypt", // Required field with valid value
      totp_secret: "",
      backup_codes: [],
      private_metadata: {},
      unsafe_metadata: {},
      delete_self_enabled: null,
      legal_accepted_at: null,
      skip_legal_checks: null,
      create_organization_enabled: null,
      create_organizations_limit: null,
    };

    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/users",
      {
        method: "POST",
        headers: getClerkHeaders(
          "conn_mod_def::GCT_4OlUshg::VU_wKTJ7RbCaeYvjHd4Izw",
        ),
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
    return handleError(error);
  }
});
