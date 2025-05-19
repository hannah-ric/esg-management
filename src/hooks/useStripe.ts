import { useState } from "react";
import {
  createPaymentIntent,
  confirmPaymentIntent,
  createSubscription,
  cancelSubscription,
} from "@/lib/stripe-service";

type PaymentIntentParams = Parameters<typeof createPaymentIntent>[0];
type SubscriptionParams = Parameters<typeof createSubscription>[0];
type CancelSubscriptionParams = Parameters<typeof cancelSubscription>[0];

export function useStripe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Creates a payment intent
   */
  const handleCreatePaymentIntent = async (params: PaymentIntentParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createPaymentIntent(params);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Confirms a payment intent
   */
  const handleConfirmPaymentIntent = async (paymentIntentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await confirmPaymentIntent(paymentIntentId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a subscription
   */
  const handleCreateSubscription = async (params: SubscriptionParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createSubscription(params);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancels a subscription
   */
  const handleCancelSubscription = async (params: CancelSubscriptionParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cancelSubscription(params);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createPaymentIntent: handleCreatePaymentIntent,
    confirmPaymentIntent: handleConfirmPaymentIntent,
    createSubscription: handleCreateSubscription,
    cancelSubscription: handleCancelSubscription,
  };
}
