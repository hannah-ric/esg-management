-- Create table for storing extracted ESG data points
CREATE TABLE IF NOT EXISTS esg_data_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  metric_id TEXT NOT NULL,
  value TEXT NOT NULL,
  context TEXT,
  confidence FLOAT,
  source TEXT,
  framework_id TEXT,
  disclosure_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id),
  is_edited BOOLEAN DEFAULT FALSE
);

-- Create table for storing framework mappings
CREATE TABLE IF NOT EXISTS esg_framework_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  framework_id TEXT NOT NULL,
  disclosure_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Enable row level security
ALTER TABLE esg_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_framework_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies for esg_data_points
DROP POLICY IF EXISTS "Users can view all data points" ON esg_data_points;
CREATE POLICY "Users can view all data points"
  ON esg_data_points FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own data points" ON esg_data_points;
CREATE POLICY "Users can insert their own data points"
  ON esg_data_points FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own data points" ON esg_data_points;
CREATE POLICY "Users can update their own data points"
  ON esg_data_points FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policies for esg_framework_mappings
DROP POLICY IF EXISTS "Users can view all framework mappings" ON esg_framework_mappings;
CREATE POLICY "Users can view all framework mappings"
  ON esg_framework_mappings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert framework mappings" ON esg_framework_mappings;
CREATE POLICY "Users can insert framework mappings"
  ON esg_framework_mappings FOR INSERT
  WITH CHECK (true);

-- Add realtime support
alter publication supabase_realtime add table esg_data_points;
alter publication supabase_realtime add table esg_framework_mappings;
