import { supabase } from "./supabase";
import { logger } from "./logger";

export interface PaymentIntentParams {
  amount: number;
  currency: string;
  description?: string;
  receipt_email?: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionParams {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
}

export interface CancelSubscriptionParams {
  subscriptionId: string;
  invoice_now?: boolean;
  prorate?: boolean;
  cancellation_details?: {
    comment?: string;
    feedback?:
      | "customer_service"
      | "low_quality"
      | "missing_features"
      | "other"
      | "switched_service"
      | "too_complex"
      | "too_expensive"
      | "unused";
  };
}

/**
 * Creates a payment intent using the Supabase Edge Function
 * @param params Payment intent parameters
 * @returns The payment intent object with client_secret
 */
export async function createPaymentIntent(params: PaymentIntentParams) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-create-payment-intent",
      {
        method: "POST",
        body: params,
      },
    );

    if (error) {
      logger.error("Error creating payment intent:", error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }

    if (!data || !data.clientSecret) {
      throw new Error("No client secret returned from payment intent creation");
    }

    return data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("Error in createPaymentIntent:", errorMessage);
    throw new Error(`Payment intent creation failed: ${errorMessage}`);
  }
}

/**
 * Creates a subscription for a customer
 * @param params Subscription parameters
 * @returns The created subscription object
 */
export async function createSubscription(params: SubscriptionParams) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-create-subscription",
      {
        method: "POST",
        body: params,
      },
    );

    if (error) {
      logger.error("Error creating subscription:", error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from subscription creation");
    }

    return data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("Error in createSubscription:", errorMessage);
    throw new Error(`Subscription creation failed: ${errorMessage}`);
  }
}

/**
 * Cancels a subscription
 * @param params Cancellation parameters
 * @returns The cancellation result
 */
export async function cancelSubscription(params: CancelSubscriptionParams) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-cancel-subscription",
      {
        method: "POST",
        body: params,
      },
    );

    if (error) {
      logger.error("Error canceling subscription:", error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }

    return data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("Error in cancelSubscription:", errorMessage);
    throw new Error(`Subscription cancellation failed: ${errorMessage}`);
  }
}

/**
 * Confirms a payment intent was successful by notifying the backend
 * @param paymentIntentId The ID of the payment intent to confirm
 * @returns The confirmation result
 */
export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-confirm-payment-intent",
      {
        method: "POST",
        body: { paymentIntentId },
      },
    );

    if (error) {
      logger.error("Error confirming payment intent:", error);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }

    return data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("Error in confirmPaymentIntent:", errorMessage);
    throw new Error(`Payment confirmation failed: ${errorMessage}`);
  }
}
