-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_intent_id TEXT NOT NULL,
  customer_id TEXT,
  user_id UUID REFERENCES users(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT,
  receipt_email TEXT,
  description TEXT,
  metadata JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  status TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_price_id TEXT NOT NULL UNIQUE,
  stripe_product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  interval TEXT NOT NULL,
  interval_count INTEGER DEFAULT 1,
  trial_period_days INTEGER,
  metadata JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add subscription_status to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none';

-- Enable realtime for these tables
alter publication supabase_realtime add table payments;
alter publication supabase_realtime add table subscriptions;
alter publication supabase_realtime add table subscription_plans;
