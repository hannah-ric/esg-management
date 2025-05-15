import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "",
);
