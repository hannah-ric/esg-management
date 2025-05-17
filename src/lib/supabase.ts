import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = 'https://spmqzflhdlatsfkkylwq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbXF6ZmxoZGxhdHNma2t5bHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMTI1NTEsImV4cCI6MjA2MjY4ODU1MX0.8YlKrC32v2FIPXXWoYUET3NGDCKzoYTOJCXafCzBdHI';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  // Use environment variables if available, otherwise use the hardcoded values
  import.meta.env.VITE_SUPABASE_URL || supabaseUrl,
  import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseAnonKey,
);
