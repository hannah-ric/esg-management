-- Add file_path and user_id columns to resources table
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create policy to allow users to select their own resources
DROP POLICY IF EXISTS "Users can view their own resources" ON resources;
CREATE POLICY "Users can view their own resources"
ON resources FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policy to allow users to insert their own resources
DROP POLICY IF EXISTS "Users can insert their own resources" ON resources;
CREATE POLICY "Users can insert their own resources"
ON resources FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own resources
DROP POLICY IF EXISTS "Users can update their own resources" ON resources;
CREATE POLICY "Users can update their own resources"
ON resources FOR UPDATE
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own resources
DROP POLICY IF EXISTS "Users can delete their own resources" ON resources;
CREATE POLICY "Users can delete their own resources"
ON resources FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on resources table
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
