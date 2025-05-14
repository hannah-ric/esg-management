import { corsHeaders } from "@shared/cors.ts";
import { handleError, handleValidationError } from "@shared/error-handler.ts";
import { getClerkHeaders, validateClerkConfig } from "@shared/clerk-config.ts";

interface SetProfileImageRequest {
  userId: string;
  imageUrl: string;
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
    const { userId, imageUrl } = (await req.json()) as SetProfileImageRequest;

    if (!userId) {
      return handleValidationError("User ID is required");
    }

    if (!imageUrl) {
      return handleValidationError("Image URL is required");
    }

    // Set profile image in Clerk via Pica passthrough
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/users/${userId}/profile_image`,
      {
        method: "POST",
        headers: getClerkHeaders(
          "conn_mod_def::GCT_39g3xkY::qJjHu06yS1STMhrPvxC80Q",
        ),
        body: JSON.stringify({ imageUrl }),
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
    console.error("Error setting profile image:", error);
    return handleError(error);
  }
});
