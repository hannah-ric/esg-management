-- Create a table for historical ESG data points
CREATE TABLE IF NOT EXISTS esg_historical_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_point_id UUID NOT NULL REFERENCES esg_data_points(id) ON DELETE CASCADE,
  year VARCHAR NOT NULL,
  value TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add reporting_year column to esg_data_points if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='esg_data_points' AND column_name='reporting_year') THEN
    ALTER TABLE esg_data_points ADD COLUMN reporting_year VARCHAR;
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_historical_data_point_id ON esg_historical_data(data_point_id);
CREATE INDEX IF NOT EXISTS idx_historical_data_year ON esg_historical_data(year);

-- Enable row-level security
ALTER TABLE esg_historical_data ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own historical data" ON esg_historical_data;
CREATE POLICY "Users can view their own historical data"
  ON esg_historical_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM esg_data_points dp
      JOIN resources r ON dp.resource_id = r.id
      WHERE esg_historical_data.data_point_id = dp.id
      AND r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own historical data" ON esg_historical_data;
CREATE POLICY "Users can insert their own historical data"
  ON esg_historical_data
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM esg_data_points dp
      JOIN resources r ON dp.resource_id = r.id
      WHERE esg_historical_data.data_point_id = dp.id
      AND r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own historical data" ON esg_historical_data;
CREATE POLICY "Users can update their own historical data"
  ON esg_historical_data
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM esg_data_points dp
      JOIN resources r ON dp.resource_id = r.id
      WHERE esg_historical_data.data_point_id = dp.id
      AND r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own historical data" ON esg_historical_data;
CREATE POLICY "Users can delete their own historical data"
  ON esg_historical_data
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM esg_data_points dp
      JOIN resources r ON dp.resource_id = r.id
      WHERE esg_historical_data.data_point_id = dp.id
      AND r.user_id = auth.uid()
    )
  );

-- Enable realtime
alter publication supabase_realtime add table esg_historical_data;
