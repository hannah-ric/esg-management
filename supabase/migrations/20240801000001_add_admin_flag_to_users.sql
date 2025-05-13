-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add is_admin column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_admin') THEN
    ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create a policy to allow users to read their own admin status
DROP POLICY IF EXISTS "Users can read their own admin status" ON public.users;
CREATE POLICY "Users can read their own admin status"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Create a policy to allow only admins to update admin status
DROP POLICY IF EXISTS "Only admins can update admin status" ON public.users;
CREATE POLICY "Only admins can update admin status"
  ON public.users FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true));

-- Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;