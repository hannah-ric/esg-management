import { corsHeaders } from "@shared/cors.ts";
import { StripeWebhookEvent } from "@shared/stripe-types.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!STRIPE_WEBHOOK_SECRET) {
      throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the signature from the headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found in request headers");
    }

    // Get the raw body
    const rawBody = await req.text();

    // Parse the event
    const event = JSON.parse(rawBody) as StripeWebhookEvent;

    // Log the event type for debugging
    console.log(`Processing webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(supabase, event);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(supabase, event);
        break;
      case "customer.subscription.created":
        await handleSubscriptionCreated(supabase, event);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(supabase, event);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(supabase, event);
        break;
      case "customer.created":
        await handleCustomerCreated(supabase, event);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function handlePaymentIntentSucceeded(supabase, event) {
  const paymentIntent = event.data.object;
  console.log(`PaymentIntent ${paymentIntent.id} was successful!`);

  // Extract user ID from metadata
  const userId = paymentIntent.metadata?.user_id;

  // Store payment in database
  const { error } = await supabase.from("payments").insert({
    payment_intent_id: paymentIntent.id,
    customer_id: paymentIntent.customer,
    user_id: userId,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    payment_method: paymentIntent.payment_method,
    receipt_email: paymentIntent.receipt_email,
    description: paymentIntent.description,
    metadata: paymentIntent.metadata,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error storing payment:", error);
    throw error;
  }

  // If this is a payment for a subscription, update the user's subscription status
  if (paymentIntent.metadata?.subscription_id) {
    await supabase
      .from("subscriptions")
      .update({ status: "active" })
      .eq("subscription_id", paymentIntent.metadata.subscription_id);

    if (userId) {
      await supabase
        .from("users")
        .update({ subscription_status: "active" })
        .eq("id", userId);
    }
  }
}

async function handlePaymentIntentFailed(supabase, event) {
  const paymentIntent = event.data.object;
  console.log(`PaymentIntent ${paymentIntent.id} failed!`);

  // Extract user ID from metadata
  const userId = paymentIntent.metadata?.user_id;

  // Store failed payment in database
  const { error } = await supabase.from("payments").insert({
    payment_intent_id: paymentIntent.id,
    customer_id: paymentIntent.customer,
    user_id: userId,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    payment_method: paymentIntent.payment_method,
    receipt_email: paymentIntent.receipt_email,
    description: paymentIntent.description,
    metadata: paymentIntent.metadata,
    error_message: paymentIntent.last_payment_error?.message,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error storing failed payment:", error);
    throw error;
  }

  // If this is a payment for a subscription, update the subscription status
  if (paymentIntent.metadata?.subscription_id) {
    await supabase
      .from("subscriptions")
      .update({ status: "incomplete" })
      .eq("subscription_id", paymentIntent.metadata.subscription_id);

    if (userId) {
      await supabase
        .from("users")
        .update({ subscription_status: "incomplete" })
        .eq("id", userId);
    }
  }
}

async function handleCustomerCreated(supabase, event) {
  const customer = event.data.object;
  console.log(`Customer ${customer.id} was created!`);

  // Extract user ID from metadata
  const userId = customer.metadata?.user_id;
  if (!userId) {
    console.warn("No user_id found in customer metadata");
    return;
  }

  // Update user with Stripe customer ID
  const { error } = await supabase
    .from("users")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user with customer ID:", error);
    throw error;
  }
}

async function handleSubscriptionCreated(supabase, event) {
  const subscription = event.data.object;
  console.log(`Subscription ${subscription.id} was created!`);

  // Get user ID from metadata
  const userId = subscription.metadata?.user_id;
  if (!userId) {
    console.warn("No user_id found in subscription metadata");
    return;
  }

  // Store subscription in database
  const { error } = await supabase.from("subscriptions").insert({
    subscription_id: subscription.id,
    customer_id: subscription.customer,
    user_id: userId,
    status: subscription.status,
    current_period_start: new Date(
      subscription.current_period_start * 1000,
    ).toISOString(),
    current_period_end: new Date(
      subscription.current_period_end * 1000,
    ).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    plan_id: subscription.items.data[0]?.price.id,
    quantity: subscription.items.data[0]?.quantity,
    metadata: subscription.metadata,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error storing subscription:", error);
    throw error;
  }

  // Update user subscription status
  const { error: userError } = await supabase
    .from("users")
    .update({ subscription_status: subscription.status })
    .eq("id", userId);

  if (userError) {
    console.error("Error updating user subscription status:", userError);
    throw userError;
  }
}

async function handleSubscriptionUpdated(supabase, event) {
  const subscription = event.data.object;
  console.log(`Subscription ${subscription.id} was updated!`);

  // Get user ID from metadata or from existing subscription
  let userId = subscription.metadata?.user_id;

  if (!userId) {
    // Try to get user_id from existing subscription
    const { data, error } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("subscription_id", subscription.id)
      .single();

    if (error || !data) {
      console.warn("Could not find user_id for subscription", subscription.id);
      return;
    }

    userId = data.user_id;
  }

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
      cancel_at_period_end: subscription.cancel_at_period_end,
      plan_id: subscription.items.data[0]?.price.id,
      quantity: subscription.items.data[0]?.quantity,
      metadata: subscription.metadata,
      updated_at: new Date().toISOString(),
    })
    .eq("subscription_id", subscription.id);

  if (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }

  // Update user subscription status
  const { error: userError } = await supabase
    .from("users")
    .update({ subscription_status: subscription.status })
    .eq("id", userId);

  if (userError) {
    console.error("Error updating user subscription status:", userError);
    throw userError;
  }
}

async function handleSubscriptionDeleted(supabase, event) {
  const subscription = event.data.object;
  console.log(`Subscription ${subscription.id} was deleted!`);

  // Get user ID from existing subscription
  const { data, error: fetchError } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("subscription_id", subscription.id)
    .single();

  if (fetchError || !data) {
    console.warn("Could not find user_id for subscription", subscription.id);
    return;
  }

  const userId = data.user_id;

  // Update subscription in database
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : new Date().toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq("subscription_id", subscription.id);

  if (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }

  // Update user subscription status
  const { error: userError } = await supabase
    .from("users")
    .update({ subscription_status: "canceled" })
    .eq("id", userId);

  if (userError) {
    console.error("Error updating user subscription status:", userError);
    throw userError;
  }
}
