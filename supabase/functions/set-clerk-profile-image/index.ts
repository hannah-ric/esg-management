import { corsHeaders } from "@shared/cors.ts";

interface SetProfileImageRequest {
  userId: string;
  imageUrl: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { userId, imageUrl } = (await req.json()) as SetProfileImageRequest;

    if (!userId || !imageUrl) {
      return new Response(
        JSON.stringify({ error: "User ID and image URL are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Create FormData with the image URL
    const formData = new FormData();

    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageBlob = await imageResponse.blob();
    formData.append("file", imageBlob);

    // Set profile image in Clerk via Pica passthrough
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/users/${userId}/profile_image`,
      {
        method: "POST",
        headers: {
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
          "x-pica-connection-key":
            Deno.env.get("PICA_CLERK_CONNECTION_KEY") || "",
          "x-pica-action-id":
            "conn_mod_def::GCT_4EsnqcI::JakOn2mXRP-GrV1MikK9Fg",
        },
        body: formData,
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
    console.error("Error setting profile image:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
