-- Create resources table for storing ESG resources and metadata
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  framework TEXT,
  url TEXT NOT NULL,
  file_type TEXT,
  source TEXT,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tags TEXT[]
);

-- Enable row level security
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public access to resources" ON resources;
CREATE POLICY "Public access to resources"
ON resources FOR SELECT
USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE resources;
