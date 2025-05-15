-- Update the esg_plans table structure to match the AppContext types

-- Ensure the implementation_phases table has the correct structure
ALTER TABLE IF EXISTS esg_plan_implementation_phases
  ADD COLUMN IF NOT EXISTS duration TEXT;

-- Ensure the implementation_tasks table has the correct structure
ALTER TABLE IF EXISTS esg_plan_implementation_tasks
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'not_started';

-- Enable realtime for these tables
alter publication supabase_realtime add table esg_plans;
alter publication supabase_realtime add table esg_recommendations;
alter publication supabase_realtime add table esg_plan_implementation_phases;
alter publication supabase_realtime add table esg_plan_implementation_tasks;
