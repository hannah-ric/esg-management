import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    // First try to get the key from the database
    const { data, error } = await supabaseClient
      .from("api_keys")
      .select("value")
      .eq("key", "CLERK_PUBLISHABLE_KEY")
      .single();

    let publishableKey = data?.value || null;

    // If not found in database, try environment variable as fallback
    if (!publishableKey) {
      publishableKey = Deno.env.get("CLERK_PUBLISHABLE_KEY") || null;
      console.log("Using Clerk publishable key from environment variable");
    } else {
      console.log("Using Clerk publishable key from database");
    }

    // Determine the source of the key for logging purposes
    const source =
      publishableKey === Deno.env.get("CLERK_PUBLISHABLE_KEY")
        ? "environment"
        : "database";

    // Validate the key format to ensure it's a valid Clerk publishable key
    if (publishableKey && !publishableKey.startsWith("pk_")) {
      console.error("Invalid Clerk publishable key format");
      publishableKey = null;
    }

    // Return the key
    return new Response(
      JSON.stringify({
        publishableKey,
        source,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error fetching Clerk key:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
