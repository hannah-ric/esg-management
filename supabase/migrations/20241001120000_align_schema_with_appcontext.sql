-- Add user_id to materiality_topics
ALTER TABLE public.materiality_topics
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add RLS policy for user_id on materiality_topics (example)
DROP POLICY IF EXISTS "Users can manage their own materiality_topics" ON public.materiality_topics;
CREATE POLICY "Users can manage their own materiality_topics"
  ON public.materiality_topics FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS materiality_topics_user_id_idx ON public.materiality_topics(user_id);


-- Add user_id to esg_plans
ALTER TABLE public.esg_plans
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add RLS policy for user_id on esg_plans (example)
DROP POLICY IF EXISTS "Users can manage their own esg_plans" ON public.esg_plans;
CREATE POLICY "Users can manage their own esg_plans"
  ON public.esg_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS esg_plans_user_id_idx ON public.esg_plans(user_id);

-- Create esg_recommendations table
CREATE TABLE IF NOT EXISTS public.esg_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    esg_plan_id UUID REFERENCES public.esg_plans(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For RLS and direct query if needed
    title TEXT,
    description TEXT,
    framework TEXT,
    indicator TEXT,
    priority TEXT, 
    effort TEXT,
    impact TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.esg_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own esg_recommendations" ON public.esg_recommendations;
CREATE POLICY "Users can manage their own esg_recommendations"
    ON public.esg_recommendations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS esg_recommendations_esg_plan_id_idx ON public.esg_recommendations(esg_plan_id);
CREATE INDEX IF NOT EXISTS esg_recommendations_user_id_idx ON public.esg_recommendations(user_id);


-- Create esg_plan_implementation_phases table
CREATE TABLE IF NOT EXISTS public.esg_plan_implementation_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    esg_plan_id UUID REFERENCES public.esg_plans(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For RLS
    title TEXT,
    description TEXT,
    duration TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.esg_plan_implementation_phases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own esg_plan_implementation_phases" ON public.esg_plan_implementation_phases;
CREATE POLICY "Users can manage their own esg_plan_implementation_phases"
    ON public.esg_plan_implementation_phases FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS esg_plan_implementation_phases_esg_plan_id_idx ON public.esg_plan_implementation_phases(esg_plan_id);
CREATE INDEX IF NOT EXISTS esg_plan_implementation_phases_user_id_idx ON public.esg_plan_implementation_phases(user_id);


-- Create esg_plan_implementation_tasks table
CREATE TABLE IF NOT EXISTS public.esg_plan_implementation_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_id UUID REFERENCES public.esg_plan_implementation_phases(id) ON DELETE CASCADE, 
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For RLS
    title TEXT,
    description TEXT,
    status TEXT, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.esg_plan_implementation_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own esg_plan_implementation_tasks" ON public.esg_plan_implementation_tasks;
CREATE POLICY "Users can manage their own esg_plan_implementation_tasks"
    ON public.esg_plan_implementation_tasks FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS esg_plan_implementation_tasks_phase_id_idx ON public.esg_plan_implementation_tasks(phase_id);
CREATE INDEX IF NOT EXISTS esg_plan_implementation_tasks_user_id_idx ON public.esg_plan_implementation_tasks(user_id);

-- Add realtime support for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.esg_recommendations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.esg_plan_implementation_phases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.esg_plan_implementation_tasks; 