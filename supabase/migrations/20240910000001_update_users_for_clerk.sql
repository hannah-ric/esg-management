-- Update users table to work with Clerk
-- This migration ensures the users table can handle Clerk user IDs

-- Add columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_name') THEN
    ALTER TABLE users ADD COLUMN first_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_name') THEN
    ALTER TABLE users ADD COLUMN last_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'image_url') THEN
    ALTER TABLE users ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Update the full_name column to be generated from first_name and last_name
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
    -- Drop any existing triggers that might interfere
    DROP TRIGGER IF EXISTS update_full_name ON users;
    
    -- Create a function to update full_name
    CREATE OR REPLACE FUNCTION update_full_name()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.full_name = TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Create a trigger to update full_name when first_name or last_name changes
    CREATE TRIGGER update_full_name
    BEFORE INSERT OR UPDATE OF first_name, last_name ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_full_name();
  END IF;
END $$;
