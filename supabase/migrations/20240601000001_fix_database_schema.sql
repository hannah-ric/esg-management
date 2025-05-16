-- Add tables to supabase_realtime publication only if not already members
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = tbl.tablename
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I;', tbl.tablename);
    END IF;
  END LOOP;
END $$;

-- Add foreign key between esg_plans and esg_recommendations if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'esg_recommendations_plan_id_fkey'
  ) THEN
    ALTER TABLE public.esg_recommendations
    ADD CONSTRAINT esg_recommendations_plan_id_fkey 
    FOREIGN KEY (plan_id) REFERENCES public.esg_plans(id);
  END IF;
END $$;

-- Add user_id column to materiality_topics if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'materiality_topics' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.materiality_topics
    ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;