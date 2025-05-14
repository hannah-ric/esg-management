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
  charges: {
    object: string;
    data: Array<any>;
    has_more: boolean;
    url: string;
  };
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  customer: string | null;
  description: string | null;
  invoice: string | null;
  last_payment_error: any | null;
  livemode: boolean;
  metadata: Record<string, string>;
  next_action: any | null;
  on_behalf_of: string | null;
  payment_method: string | null;
  payment_method_options: Record<string, any>;
  payment_method_types: string[];
  receipt_email: string | null;
  review: string | null;
  setup_future_usage: string | null;
  shipping: any | null;
  statement_descriptor: string | null;
  statement_descriptor_suffix: string | null;
  status: string;
  transfer_data: any | null;
  transfer_group: string | null;
}

export interface StripePayout {
  id: string;
  object: string;
  amount: number;
  arrival_date: number;
  automatic: boolean;
  balance_transaction: string;
  created: number;
  currency: string;
  description: string | null;
  destination: string | null;
  failure_balance_transaction: string | null;
  failure_code: string | null;
  failure_message: string | null;
  livemode: boolean;
  metadata: Record<string, string>;
  method: string;
  original_payout: string | null;
  reversed_by: string | null;
  source_type: string;
  statement_descriptor: string | null;
  status: string;
  type: string;
}

export interface StripeRefund {
  id: string;
  object: string;
  amount: number;
  balance_transaction: string | null;
  charge: string;
  created: number;
  currency: string;
  metadata: Record<string, string>;
  payment_intent: string;
  reason: string | null;
  receipt_number: string | null;
  source_transfer_reversal: string | null;
  status: string;
  transfer_reversal: string | null;
}

export interface StripeCustomer {
  id: string;
  object: string;
  address: any | null;
  balance: number;
  created: number;
  currency: string | null;
  default_source: string | null;
  delinquent: boolean;
  description: string | null;
  discount: any | null;
  email: string | null;
  invoice_prefix: string;
  invoice_settings: {
    custom_fields: any | null;
    default_payment_method: string | null;
    footer: string | null;
  };
  livemode: boolean;
  metadata: Record<string, string>;
  name: string | null;
  next_invoice_sequence: number;
  phone: string | null;
  preferred_locales: string[];
  shipping: any | null;
  tax_exempt: string;
  test_clock: string | null;
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
  billing_thresholds: any | null;
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
  description: string | null;
  discount: any | null;
  ended_at: number | null;
  items: {
    object: string;
    data: Array<{
      id: string;
      object: string;
      billing_thresholds: any | null;
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
        transform_quantity: any | null;
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
  latest_invoice: string | null;
  livemode: boolean;
  metadata: Record<string, string>;
  next_pending_invoice_item_invoice: number | null;
  pause_collection: any | null;
  payment_settings: {
    payment_method_options: any | null;
    payment_method_types: string[] | null;
    save_default_payment_method: string | null;
  };
  pending_invoice_item_interval: any | null;
  pending_setup_intent: string | null;
  pending_update: any | null;
  schedule: string | null;
  start_date: number;
  status: string;
  transfer_data: any | null;
  trial_end: number | null;
  trial_start: number | null;
}

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

export interface StripePrice {
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
  } | null;
  tax_behavior: string;
  tiers_mode: string | null;
  transform_quantity: any | null;
  type: string;
  unit_amount: number;
  unit_amount_decimal: string;
}

export interface StripeProduct {
  id: string;
  object: string;
  active: boolean;
  created: number;
  description: string | null;
  images: string[];
  livemode: boolean;
  metadata: Record<string, string>;
  name: string;
  package_dimensions: any | null;
  shippable: boolean | null;
  statement_descriptor: string | null;
  tax_code: string | null;
  unit_label: string | null;
  updated: number;
  url: string | null;
}
