import { corsHeaders } from "@shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import axios from "https://esm.sh/axios@1.6.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";
const picaSecretKey = Deno.env.get("PICA_SECRET_KEY") || "";
const picaStripeConnectionKey =
  Deno.env.get("PICA_STRIPE_CONNECTION_KEY") || "";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    if (!picaSecretKey || !picaStripeConnectionKey) {
      throw new Error("Missing Pica environment variables");
    }

    // Get request body
    const requestData = await req.json();
    const { id, payment_method } = requestData;

    if (!id) {
      throw new Error("Missing required parameter: id");
    }

    // Retrieve the payment intent to get the client_secret
    const retrieveResponse = await axios.get(
      `https://api.picaos.com/v1/passthrough/payment_intents/${id}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-pica-secret": picaSecretKey,
          "x-pica-connection-key": picaStripeConnectionKey,
          "x-pica-action-id":
            "conn_mod_def::GCmLP3yB4Mg::rCRiTSApTyy-gb44BkTwPw",
        },
      },
    );

    const paymentIntent = retrieveResponse.data;

    return new Response(JSON.stringify(paymentIntent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error confirming payment intent:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
