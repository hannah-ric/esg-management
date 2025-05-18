/**
 * Type definitions for Stripe-related functionality
 */

export interface StripeWebhookEvent {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: {
    object: Record<string, unknown>;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string | null;
    idempotency_key: string | null;
  };
  type: string;
}

export interface StripePaymentIntent {
  id: string;
  object: string;
  amount: number;
  amount_capturable: number;
  amount_received: number;
  application: string | null;
  application_fee_amount: number | null;
  canceled_at: number | null;
  cancellation_reason: string | null;
  capture_method: string;
  charges: unknown;
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  customer: string | null;
  description: string | null;
  invoice: string | null;
  last_payment_error: Record<string, unknown> | null;
  livemode: boolean;
  metadata: Record<string, string>;
  next_action: Record<string, unknown> | null;
  on_behalf_of: string | null;
  payment_method: string | null;
  payment_method_options: Record<string, unknown> | null;
  payment_method_types: string[];
  receipt_email: string | null;
  review: string | null;
  setup_future_usage: string | null;
  shipping: Record<string, unknown> | null;
  source: string | null;
  statement_descriptor: string | null;
  statement_descriptor_suffix: string | null;
  status: string;
  transfer_data: Record<string, unknown> | null;
  transfer_group: string | null;
}

export interface StripeSubscription {
  id: string;
  object: string;
  application: string | null;
  application_fee_percent: number | null;
  automatic_tax: {
    enabled: boolean;
  };
  billing_cycle_anchor: number;
  billing_thresholds: Record<string, unknown> | null;
  cancel_at: number | null;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  collection_method: string;
  created: number;
  current_period_end: number;
  current_period_start: number;
  customer: string;
  days_until_due: number | null;
  default_payment_method: string | null;
  default_source: string | null;
  default_tax_rates: unknown[];
  discount: Record<string, unknown> | null;
  ended_at: number | null;
  items: {
    object: string;
    data: Array<{
      id: string;
      object: string;
      billing_thresholds: Record<string, unknown> | null;
      created: number;
      metadata: Record<string, string>;
      price: {
        id: string;
        object: string;
        active: boolean;
        billing_scheme: string;
        created: number;
        currency: string;
        livemode: boolean;
        lookup_key: string | null;
        metadata: Record<string, string>;
        nickname: string | null;
        product: string;
        recurring: {
          aggregate_usage: string | null;
          interval: string;
          interval_count: number;
          usage_type: string;
        };
        tax_behavior: string;
        tiers_mode: string | null;
        transform_quantity: Record<string, unknown> | null;
        type: string;
        unit_amount: number;
        unit_amount_decimal: string;
      };
      quantity: number;
      subscription: string;
      tax_rates: unknown[];
    }>;
    has_more: boolean;
    url: string;
  };
  latest_invoice: string;
  livemode: boolean;
  metadata: Record<string, string>;
  next_pending_invoice_item_invoice: number | null;
  pause_collection: Record<string, unknown> | null;
  payment_settings: {
    payment_method_options: Record<string, unknown> | null;
    payment_method_types: string[] | null;
    save_default_payment_method: string | null;
  };
  pending_invoice_item_interval: Record<string, unknown> | null;
  pending_setup_intent: string | null;
  pending_update: Record<string, unknown> | null;
  schedule: string | null;
  start_date: number;
  status: string;
  transfer_data: Record<string, unknown> | null;
  trial_end: number | null;
  trial_start: number | null;
}

// Add new interfaces for API parameters
export interface PaymentIntentCreateParams {
  amount: number;
  currency: string;
  automatic_payment_methods?: { enabled: boolean };
  confirm?: boolean;
  customer?: string;
  description?: string;
  metadata?: Record<string, string>;
  off_session?: boolean | string;
  payment_method?: string;
  receipt_email?: string;
  setup_future_usage?: string;
  shipping?: {
    address: {
      city?: string;
      country: string;
      line1?: string;
      line2?: string;
      postal_code: string;
      state?: string;
    };
    name: string;
    carrier?: string;
    phone?: string;
    tracking_number?: string;
  };
  statement_descriptor?: string;
  statement_descriptor_suffix?: string;
  transfer_data?: {
    destination: string;
    amount?: number;
  };
  transfer_group?: string;
  use_stripe_sdk?: boolean;
}

export interface PaymentIntentConfirmParams {
  payment_method: string;
  receipt_email?: string;
  setup_future_usage?: "off_session" | "on_session";
  shipping?: {
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
    name?: string;
    carrier?: string;
    phone?: string;
    tracking_number?: string;
  };
  confirmation_token?: string;
  error_on_requires_action?: boolean;
  mandate?: string;
  mandate_data?: {
    customer_acceptance: {
      type: string;
      accepted_at: number;
      online?: {
        ip_address: string;
        user_agent: string;
      };
    };
  };
  off_session?: boolean | string;
  payment_method_data?: {
    type: string;
    details: Record<string, any>;
  };
  payment_method_options?: Record<string, any>;
  return_url?: string;
}

export interface SubscriptionCreateParams {
  customer: string;
  items: Array<{ price: string }>;
  automatic_tax?: {
    enabled: boolean;
    liability?: {
      type: "account" | "self";
      account?: string;
    };
  };
  cancel_at_period_end?: boolean;
  currency?: string;
  default_payment_method?: string;
  description?: string;
  metadata?: Record<string, string>;
  payment_behavior?:
    | "allow_incomplete"
    | "default_incomplete"
    | "error_if_incomplete"
    | "pending_if_incomplete";
  trial_end?: string | number;
  trial_period_days?: number;
}
