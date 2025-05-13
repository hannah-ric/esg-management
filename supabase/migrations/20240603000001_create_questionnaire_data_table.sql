-- Create questionnaire_data table to store user questionnaire responses
CREATE TABLE IF NOT EXISTS questionnaire_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS policies
ALTER TABLE questionnaire_data ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own questionnaire data
DROP POLICY IF EXISTS "Users can view their own questionnaire data" ON questionnaire_data;
CREATE POLICY "Users can view their own questionnaire data"
  ON questionnaire_data FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own questionnaire data
DROP POLICY IF EXISTS "Users can insert their own questionnaire data" ON questionnaire_data;
CREATE POLICY "Users can insert their own questionnaire data"
  ON questionnaire_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own questionnaire data
DROP POLICY IF EXISTS "Users can update their own questionnaire data" ON questionnaire_data;
CREATE POLICY "Users can update their own questionnaire data"
  ON questionnaire_data FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS questionnaire_data_user_id_idx ON questionnaire_data (user_id);
