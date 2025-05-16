import { corsHeaders, handleCors } from "@shared/cors.index";
import { handleError } from "@shared/error-handler.index";
import { StripeWebhookEvent } from "@shared/stripe-types.index";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Verify webhook signature if secret is available
    const signature = req.headers.get("stripe-signature");

    if (!signature && webhookSecret) {
      return handleError(
        {
          message: "Missing Stripe signature",
          code: "UNAUTHORIZED",
        },
        401,
      );
    }

    // Get the raw body as text
    const rawBody = await req.text();
    let event: StripeWebhookEvent;

    try {
      // For now, just parse the JSON directly
      // In production, you would verify the signature using Stripe's library
      event = JSON.parse(rawBody);
    } catch (err) {
      return handleError(
        {
          message: "Invalid webhook payload",
          code: "INVALID_PAYLOAD",
        },
        400,
      );
    }

    // Process the event based on its type
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(event);
        break;

      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
        await handlePaymentIntentEvent(event);
        break;

      // Add more event types as needed

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return handleError(error);
  }
});

async function handleSubscriptionEvent(event: StripeWebhookEvent) {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log("Missing Supabase credentials, skipping database update");
    return;
  }

  const subscription = event.data.object;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Update subscription in database
    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        current_period_start: new Date(
          subscription.current_period_start * 1000,
        ).toISOString(),
        current_period_end: new Date(
          subscription.current_period_end * 1000,
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        canceled_at: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("subscription_id", subscription.id);

    if (error) {
      console.error("Error updating subscription in database:", error);
    } else {
      // Update user subscription status if user_id is in metadata
      if (subscription.metadata?.user_id) {
        await supabase
          .from("users")
          .update({ subscription_status: subscription.status })
          .eq("id", subscription.metadata.user_id);
      }
    }
  } catch (error) {
    console.error("Error processing subscription event:", error);
  }
}

async function handlePaymentIntentEvent(event: StripeWebhookEvent) {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log("Missing Supabase credentials, skipping database update");
    return;
  }

  const paymentIntent = event.data.object;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Store payment intent in database if you have a payments table
    const { error } = await supabase.from("payments").upsert(
      {
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        customer_id: paymentIntent.customer,
        user_id: paymentIntent.metadata?.user_id,
        metadata: paymentIntent.metadata,
        created_at: new Date(paymentIntent.created * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "payment_intent_id" },
    );

    if (error) {
      console.error("Error storing payment intent in database:", error);
    }
  } catch (error) {
    console.error("Error processing payment intent event:", error);
  }
}
