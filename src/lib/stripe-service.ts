import { supabase } from "./supabase";

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  customer?: string;
  description?: string;
  metadata?: Record<string, string>;
  receipt_email?: string;
}

export interface CreatePayoutParams {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
  statement_descriptor?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  customer?: string;
  description?: string;
  metadata?: Record<string, string>;
  receipt_email?: string;
  created: number;
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  metadata?: Record<string, string>;
  arrival_date: number;
  created: number;
}

export interface Refund {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_intent: string;
  created: number;
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
}

export interface Subscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        product: string;
      };
      quantity: number;
    }>;
  };
  metadata?: Record<string, string>;
}

/**
 * Creates a payment intent using the Stripe API
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams,
): Promise<PaymentIntent> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-create-payment-intent",
      {
        body: params,
      },
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
}

/**
 * Confirms a payment intent using the Stripe API
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId?: string,
): Promise<PaymentIntent> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-confirm-payment-intent",
      {
        body: {
          id: paymentIntentId,
          payment_method: paymentMethodId,
        },
      },
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error confirming payment intent:", error);
    throw error;
  }
}

/**
 * Creates a subscription using the Stripe API
 */
export async function createSubscription(
  params: CreateSubscriptionParams,
): Promise<Subscription> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-create-subscription",
      {
        body: params,
      },
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

/**
 * Cancels a subscription using the Stripe API
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true,
): Promise<Subscription> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-cancel-subscription",
      {
        body: {
          id: subscriptionId,
          cancel_at_period_end: cancelAtPeriodEnd,
        },
      },
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}

/**
 * Creates a payout using the Stripe API
 */
export async function createPayout(
  params: CreatePayoutParams,
): Promise<Payout> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-create-payout",
      {
        body: params,
      },
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating payout:", error);
    throw error;
  }
}

/**
 * Cancels a refund using the Stripe API
 */
export async function cancelRefund(refundId: string): Promise<Refund> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-cancel-refund",
      {
        body: { id: refundId },
      },
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error canceling refund:", error);
    throw error;
  }
}

/**
 * Lists refunds using the Stripe API
 */
export async function listRefunds(paymentIntentId?: string): Promise<Refund[]> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-list-refunds",
      {
        body: paymentIntentId ? { payment_intent: paymentIntentId } : {},
      },
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error listing refunds:", error);
    throw error;
  }
}

/**
 * Captures a payment intent using the Stripe API
 */
export async function capturePaymentIntent(
  paymentIntentId: string,
  amount?: number,
): Promise<PaymentIntent> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-capture-payment-intent",
      {
        body: { id: paymentIntentId, amount },
      },
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error capturing payment intent:", error);
    throw error;
  }
}
