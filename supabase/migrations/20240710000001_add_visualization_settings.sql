-- Add visualization settings table for ESG data dashboards
CREATE TABLE IF NOT EXISTS visualization_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_id UUID,
  chart_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  data_source VARCHAR(255),
  filters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_visualization_settings_user_id ON visualization_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_visualization_settings_dashboard_id ON visualization_settings(dashboard_id);

-- Add RLS policies
ALTER TABLE visualization_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own visualization settings" ON visualization_settings;
CREATE POLICY "Users can view their own visualization settings"
  ON visualization_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own visualization settings" ON visualization_settings;
CREATE POLICY "Users can insert their own visualization settings"
  ON visualization_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own visualization settings" ON visualization_settings;
CREATE POLICY "Users can update their own visualization settings"
  ON visualization_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table visualization_settings;
