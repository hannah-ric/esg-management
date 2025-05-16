/**
 * Type definitions for Stripe-related functionality
 */

export interface StripeWebhookEvent {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: {
    object: any;
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
  charges: any;
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  customer: string | null;
  description: string | null;
  invoice: string | null;
  last_payment_error: any;
  livemode: boolean;
  metadata: Record<string, string>;
  next_action: any;
  on_behalf_of: string | null;
  payment_method: string | null;
  payment_method_options: any;
  payment_method_types: string[];
  receipt_email: string | null;
  review: string | null;
  setup_future_usage: string | null;
  shipping: any;
  source: string | null;
  statement_descriptor: string | null;
  statement_descriptor_suffix: string | null;
  status: string;
  transfer_data: any;
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
  billing_thresholds: any;
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
  default_tax_rates: any[];
  discount: any;
  ended_at: number | null;
  items: {
    object: string;
    data: Array<{
      id: string;
      object: string;
      billing_thresholds: any;
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
        transform_quantity: any;
        type: string;
        unit_amount: number;
        unit_amount_decimal: string;
      };
      quantity: number;
      subscription: string;
      tax_rates: any[];
    }>;
    has_more: boolean;
    url: string;
  };
  latest_invoice: string;
  livemode: boolean;
  metadata: Record<string, string>;
  next_pending_invoice_item_invoice: number | null;
  pause_collection: any;
  payment_settings: {
    payment_method_options: any;
    payment_method_types: string[] | null;
    save_default_payment_method: string | null;
  };
  pending_invoice_item_interval: any;
  pending_setup_intent: string | null;
  pending_update: any;
  schedule: string | null;
  start_date: number;
  status: string;
  transfer_data: any;
  trial_end: number | null;
  trial_start: number | null;
}
