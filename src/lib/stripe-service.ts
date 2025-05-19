import { supabase } from "./supabase";

interface CreateProductParams {
  name: string;
  description?: string;
  images?: string[];
  metadata?: Record<string, string>;
  default_price_data?: {
    currency: string;
    unit_amount: number;
    recurring?: {
      interval: "day" | "week" | "month" | "year";
      interval_count?: number;
    };
  };
}

interface CreateConnectAccountParams {
  type: "standard" | "express" | "custom";
  country: string;
  email: string;
  business_type?: "individual" | "company" | "non_profit" | "government_entity";
  business_profile?: {
    name?: string;
    url?: string;
    product_description?: string;
  };
  metadata?: Record<string, string>;
}

interface UpdateFunctionParams {
  function_slug: string;
  ref: string; // 20-character project reference
  name?: string;
  body?: Record<string, unknown>;
  verify_jwt?: boolean;
}

export async function createPaymentIntent(params: {
  amount: number;
  currency: string;
  description?: string;
  receipt_email?: string;
  metadata?: Record<string, string>;
  customer?: string;
}) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-create-payment-intent",
      {
        body: params,
      },
    );

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
}

export async function confirmPaymentIntent(
  paymentIntentId: string,
  options?: {
    payment_method?: string;
    receipt_email?: string;
    return_url?: string;
  },
) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-confirm-payment-intent",
      {
        body: {
          payment_intent_id: paymentIntentId,
          ...options,
        },
      },
    );

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Error confirming payment intent:", error);
    throw error;
  }
}

export async function createSubscription(params: {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
}) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-create-subscription",
      {
        body: params,
      },
    );

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

export async function cancelSubscription(params: { subscriptionId: string }) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-cancel-subscription",
      {
        body: params,
      },
    );

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}

export const stripeService = {
  async createProduct(params: CreateProductParams) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-stripe-product",
        {
          body: params,
        },
      );

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  async createConnectAccount(params: CreateConnectAccountParams) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-stripe-connect-account",
        {
          body: params,
        },
      );

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error("Error creating connect account:", error);
      throw error;
    }
  },

  async updateSupabaseFunction(params: UpdateFunctionParams) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-update-supabase-function",
        {
          body: params,
        },
      );

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error("Error updating supabase function:", error);
      throw error;
    }
  },
};

export type PaymentIntentParams = Parameters<typeof createPaymentIntent>[0];
export type SubscriptionParams = Parameters<typeof createSubscription>[0];
export type CancelSubscriptionParams = Parameters<typeof cancelSubscription>[0];
