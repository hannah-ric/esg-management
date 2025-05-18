import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.index.ts";

const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
const PICA_SUPABASE_CONNECTION_KEY = Deno.env.get(
  "PICA_SUPABASE_CONNECTION_KEY",
);
const SUPABASE_PROJECT_ID = Deno.env.get("SUPABASE_PROJECT_ID");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { function_slug, name, body, verify_jwt } = await req.json();

    // Validate required fields
    if (!function_slug) {
      return new Response(
        JSON.stringify({ error: "Function slug is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
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

    // Prepare request body
    const requestBody: Record<string, unknown> = {};
    if (name !== undefined) requestBody.name = name;
    if (body !== undefined) requestBody.body = body;
    if (verify_jwt !== undefined) requestBody.verify_jwt = verify_jwt;

    // Call Supabase API through Pica passthrough
    const url = `https://api.picaos.com/v1/passthrough/projects/${SUPABASE_PROJECT_ID}/functions/${function_slug}`;
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
    // Handle errors
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
