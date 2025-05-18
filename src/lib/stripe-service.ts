import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CreateProductParams {
  name: string;
  description?: string;
  active?: boolean;
  default_price_data?: {
    currency: string;
    unit_amount: number;
    recurring?: {
      interval: "day" | "week" | "month" | "year";
      interval_count?: number;
    };
  };
}

export interface CreateConnectAccountParams {
  country: string;
  email: string;
  business_type?: "company" | "government_entity" | "individual" | "non_profit";
  business_profile?: {
    url?: string;
    mcc?: string;
    support_email?: string;
    support_url?: string;
    support_address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
}

export interface UpdateFunctionParams {
  function_slug: string;
  name?: string;
  body?: string;
  verify_jwt?: boolean;
}

// Payment Intent functions
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
      "stripe-create-payment-intent",
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
      "stripe-confirm-payment-intent",
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
      "stripe-create-subscription",
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

// Product and subscription functions
export const stripeService = {
  async createProduct(params: CreateProductParams) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-stripe-product",
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
        "create-stripe-connect-account",
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
        "update-supabase-function",
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
