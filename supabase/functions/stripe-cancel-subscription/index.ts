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

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const requestData = await req.json();
    const { id, cancel_at_period_end = true, comment, feedback } = requestData;

    if (!id) {
      throw new Error("Missing required parameter: id");
    }

    // Prepare form data for Stripe API
    const params = new URLSearchParams();

    // Add optional parameters
    if (comment) {
      params.append("cancellation_details[comment]", comment);
    }

    if (feedback) {
      params.append("cancellation_details[feedback]", feedback);
    }

    // Call Stripe API via Pica passthrough
    const response = await axios.delete(
      `https://api.picaos.com/v1/passthrough/subscriptions/${id}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-pica-secret": picaSecretKey,
          "x-pica-connection-key": picaStripeConnectionKey,
          "x-pica-action-id":
            "conn_mod_def::GCmLJuvsIqw::qCRnEtxAR3ivKx1u05c7QQ",
        },
        data: params.toString(),
      },
    );

    const subscription = response.data;

    // Update subscription in database
    const { data: existingSubscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("subscription_id", id)
      .single();

    if (!fetchError && existingSubscription) {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: subscription.status,
          canceled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toISOString()
            : new Date().toISOString(),
          cancel_at_period_end: cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq("subscription_id", id);

      if (error) {
        console.error("Error updating subscription:", error);
      } else {
        // Update user subscription status
        await supabase
          .from("users")
          .update({ subscription_status: "canceled" })
          .eq("id", existingSubscription.user_id);
      }
    }

    return new Response(JSON.stringify(subscription), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
