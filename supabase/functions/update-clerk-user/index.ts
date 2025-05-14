import { corsHeaders } from "@shared/cors.ts";
import { handleError, handleValidationError } from "@shared/error-handler.ts";
import { getClerkHeaders, validateClerkConfig } from "@shared/clerk-config.ts";

interface UpdateUserRequest {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  companyName?: string;
  publicMetadata?: Record<string, any>;
  privateMetadata?: Record<string, any>;
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
      firstName,
      lastName,
      email,
      companyName,
      publicMetadata,
      privateMetadata,
    } = (await req.json()) as UpdateUserRequest;

    if (!userId) {
      return handleValidationError("User ID is required");
    }

    // Prepare update data
    const updateData: Record<string, any> = {};

    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;

    // Handle public metadata updates
    if (publicMetadata !== undefined) {
      updateData.public_metadata = publicMetadata;
    } else if (companyName !== undefined) {
      // For backward compatibility
      updateData.public_metadata = { company_name: companyName };
    }

    // Handle private metadata updates if provided
    if (privateMetadata !== undefined) {
      updateData.private_metadata = privateMetadata;
    }

    // Handle email updates if provided
    if (email !== undefined) {
      if (!email) {
        return handleValidationError("Email cannot be empty");
      }
      updateData.email_addresses = [{ email_address: email, primary: true }];
    }

    // Update user in Clerk via Pica passthrough
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/users/${userId}`,
      {
        method: "PATCH",
        headers: getClerkHeaders(
          "conn_mod_def::GCT_3Iy-Ixs::Yx-Yx-ORQnCQXXXXXXXXXX",
        ),
        body: JSON.stringify(updateData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Clerk API error: ${JSON.stringify(errorData)}`);
    }

    const updatedUser = await response.json();

    return new Response(JSON.stringify({ user: updatedUser }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return handleError(error);
  }
});
