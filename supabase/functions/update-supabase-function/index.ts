import { corsHeaders } from "@shared/cors";
import { handleError } from "@shared/error-handler";
import { validateRequiredFields } from "@shared/validation";

const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
const PICA_SUPABASE_CONNECTION_KEY = Deno.env.get(
  "PICA_SUPABASE_CONNECTION_KEY",
);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { function_slug, name, body, verify_jwt, ref } = await req.json();

    // Validate required fields
    const validationError = validateRequiredFields({ function_slug, ref }, [
      "function_slug",
      "ref",
    ]);

    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate function_slug format
    const slugRegex = /^[A-Za-z0-9_-]+$/;
    if (!slugRegex.test(function_slug)) {
      return new Response(
        JSON.stringify({ error: "Invalid function slug format" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Validate ref format (20 characters)
    if (typeof ref !== "string" || ref.length !== 20) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid project reference format. Must be a 20-character string.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Prepare request body
    const requestBody: Record<string, unknown> = {};
    if (name !== undefined) requestBody.name = name;
    if (body !== undefined) requestBody.body = body;
    if (verify_jwt !== undefined) requestBody.verify_jwt = verify_jwt;

    // Call Supabase API through Pica passthrough
    const url = `https://api.picaos.com/v1/passthrough/projects/${ref}/functions/${function_slug}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-pica-secret": PICA_SECRET_KEY || "",
        "x-pica-connection-key": PICA_SUPABASE_CONNECTION_KEY || "",
        "x-pica-action-id": "conn_mod_def::GC40T9G4D2s::JTpF0ZTqR22d8DcPOiAyfw",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // Return the response with CORS headers
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: response.status,
    });
  } catch (error) {
    return handleError(error, "Error updating Supabase function");
  }
});
