-- Create table for storing ESG historical analysis results
CREATE TABLE IF NOT EXISTS esg_analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_id TEXT NOT NULL,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  trend TEXT NOT NULL,
  percent_change NUMERIC NOT NULL,
  insights JSONB,
  forecast JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS esg_analysis_results_user_id_idx ON esg_analysis_results(user_id);
CREATE INDEX IF NOT EXISTS esg_analysis_results_metric_id_idx ON esg_analysis_results(metric_id);
CREATE INDEX IF NOT EXISTS esg_analysis_results_resource_id_idx ON esg_analysis_results(resource_id);

-- Enable row-level security
ALTER TABLE esg_analysis_results ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own analysis results" ON esg_analysis_results;
CREATE POLICY "Users can view their own analysis results"
  ON esg_analysis_results FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own analysis results" ON esg_analysis_results;
CREATE POLICY "Users can insert their own analysis results"
  ON esg_analysis_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own analysis results" ON esg_analysis_results;
CREATE POLICY "Users can update their own analysis results"
  ON esg_analysis_results FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own analysis results" ON esg_analysis_results;
CREATE POLICY "Users can delete their own analysis results"
  ON esg_analysis_results FOR DELETE
  USING (auth.uid() = user_id);

-- Add to realtime publication
alter publication supabase_realtime add table esg_analysis_results;
