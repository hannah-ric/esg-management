-- Add Clerk API keys to Supabase secrets
-- This migration ensures the required environment variables are available for Clerk integration

-- Create a function to check if the environment variables exist
CREATE OR REPLACE FUNCTION check_clerk_env_vars()
RETURNS VOID AS $$
DECLARE
  clerk_publishable_key TEXT;
  clerk_secret_key TEXT;
  pica_secret_key TEXT;
  pica_clerk_connection_key TEXT;
BEGIN
  -- Get environment variables
  clerk_publishable_key := current_setting('app.settings.clerk_publishable_key', TRUE);
  clerk_secret_key := current_setting('app.settings.clerk_secret_key', TRUE);
  pica_secret_key := current_setting('app.settings.pica_secret_key', TRUE);
  pica_clerk_connection_key := current_setting('app.settings.pica_clerk_connection_key', TRUE);
  
  -- Log the status of environment variables
  RAISE NOTICE 'Clerk environment variables status:';
  RAISE NOTICE 'CLERK_PUBLISHABLE_KEY: %', CASE WHEN clerk_publishable_key IS NULL THEN 'missing' ELSE 'set' END;
  RAISE NOTICE 'CLERK_SECRET_KEY: %', CASE WHEN clerk_secret_key IS NULL THEN 'missing' ELSE 'set' END;
  RAISE NOTICE 'PICA_SECRET_KEY: %', CASE WHEN pica_secret_key IS NULL THEN 'missing' ELSE 'set' END;
  RAISE NOTICE 'PICA_CLERK_CONNECTION_KEY: %', CASE WHEN pica_clerk_connection_key IS NULL THEN 'missing' ELSE 'set' END;
  
  -- Note: This function doesn't actually set the environment variables
  -- It just checks if they exist and logs their status
  -- The actual environment variables should be set in the Supabase dashboard
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to check environment variables
SELECT check_clerk_env_vars();

-- Drop the function as it's only needed for this migration
DROP FUNCTION check_clerk_env_vars();
