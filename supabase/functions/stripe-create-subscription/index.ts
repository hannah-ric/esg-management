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
    const { customerId, priceId, metadata, trialPeriodDays } = requestData;

    if (!customerId || !priceId) {
      throw new Error("Missing required parameters: customerId and priceId");
    }

    // Prepare form data for Stripe API
    const params = new URLSearchParams();
    params.append("customer", customerId);
    params.append("items[0][price]", priceId);

    // Add optional parameters
    if (trialPeriodDays) {
      params.append("trial_period_days", trialPeriodDays.toString());
    }

    // Add metadata if provided
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        params.append(`metadata[${key}]`, value as string);
      });
    }

    // Call Stripe API via Pica passthrough
    const response = await axios.post(
      "https://api.picaos.com/v1/passthrough/subscriptions",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-pica-secret": picaSecretKey,
          "x-pica-connection-key": picaStripeConnectionKey,
          "x-pica-action-id":
            "conn_mod_def::GCmLLKb3SYA::G12brmc7RrivZndckTk7rQ",
        },
      },
    );

    const subscription = response.data;

    // Store subscription in database
    if (metadata?.user_id) {
      const { error } = await supabase.from("subscriptions").insert({
        subscription_id: subscription.id,
        customer_id: subscription.customer,
        user_id: metadata.user_id,
        status: subscription.status,
        current_period_start: new Date(
          subscription.current_period_start * 1000,
        ).toISOString(),
        current_period_end: new Date(
          subscription.current_period_end * 1000,
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        plan_id: subscription.items.data[0]?.price.id,
        quantity: subscription.items.data[0]?.quantity,
        metadata: subscription.metadata,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error storing subscription:", error);
        // Continue execution even if database storage fails
      } else {
        // Update user subscription status
        await supabase
          .from("users")
          .update({ subscription_status: subscription.status })
          .eq("id", metadata.user_id);
      }
    }

    return new Response(JSON.stringify(subscription), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
