export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_end: number;
  current_period_start: number;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        product: string;
        unit_amount: number;
        currency: string;
        recurring: {
          interval: string;
          interval_count: number;
        };
      };
    }>;
  };
  metadata?: Record<string, any>;
}

export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: string;
    interval_count: number;
  };
  metadata?: Record<string, any>;
}

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  metadata?: Record<string, any>;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  customer?: string;
  metadata?: Record<string, any>;
}

export interface StripeRefund {
  id: string;
  amount: number;
  currency: string;
  payment_intent: string;
  status: string;
  reason?: string;
  metadata?: Record<string, any>;
}
