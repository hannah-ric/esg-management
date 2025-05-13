-- Create table for storing ESG analysis results
CREATE TABLE IF NOT EXISTS esg_analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id TEXT NOT NULL,
  trend TEXT NOT NULL,
  percent_change NUMERIC NOT NULL,
  forecast JSONB,
  insights TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on metric_id for faster lookups
CREATE INDEX IF NOT EXISTS esg_analysis_results_metric_id_idx ON esg_analysis_results (metric_id);

-- Enable row level security
ALTER TABLE esg_analysis_results ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
DROP POLICY IF EXISTS "Authenticated users can read analysis results" ON esg_analysis_results;
CREATE POLICY "Authenticated users can read analysis results"
  ON esg_analysis_results
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for service role to insert/update
DROP POLICY IF EXISTS "Service role can insert and update analysis results" ON esg_analysis_results;
CREATE POLICY "Service role can insert and update analysis results"
  ON esg_analysis_results
  FOR ALL
  TO service_role
  USING (true);

-- Enable realtime subscriptions
alter publication supabase_realtime add table esg_analysis_results;
