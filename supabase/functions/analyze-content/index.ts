import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "@shared/cors.index.ts";

const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
const PICA_DIFFBOT_CONNECTION_KEY = Deno.env.get("PICA_DIFFBOT_CONNECTION_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Get URL from query parameters
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: "URL parameter is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Prepare query parameters
    const params = new URLSearchParams();
    params.append("url", targetUrl);

    // Add optional parameters if they exist in the request
    for (const [key, value] of url.searchParams.entries()) {
      if (key !== "url" && value) {
        params.append(key, value);
      }
    }

    // Call Diffbot API through Pica passthrough
    const apiUrl = `https://api.picaos.com/v1/passthrough/v3/analyze?${params.toString()}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-pica-secret": PICA_SECRET_KEY || "",
        "x-pica-connection-key": PICA_DIFFBOT_CONNECTION_KEY || "",
        "x-pica-action-id": "conn_mod_def::GCNhlCQbEbA::Ejy9S1uAQ6GCMnNPbQFeTA",
      },
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
