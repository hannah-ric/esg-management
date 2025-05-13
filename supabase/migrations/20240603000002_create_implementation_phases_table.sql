-- Create implementation_phases table to store user implementation roadmap
CREATE TABLE IF NOT EXISTS implementation_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phases JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS policies
ALTER TABLE implementation_phases ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own implementation phases
DROP POLICY IF EXISTS "Users can view their own implementation phases" ON implementation_phases;
CREATE POLICY "Users can view their own implementation phases"
  ON implementation_phases FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own implementation phases
DROP POLICY IF EXISTS "Users can insert their own implementation phases" ON implementation_phases;
CREATE POLICY "Users can insert their own implementation phases"
  ON implementation_phases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own implementation phases
DROP POLICY IF EXISTS "Users can update their own implementation phases" ON implementation_phases;
CREATE POLICY "Users can update their own implementation phases"
  ON implementation_phases FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS implementation_phases_user_id_idx ON implementation_phases (user_id);
