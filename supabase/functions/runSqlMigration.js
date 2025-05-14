// This script runs the SQL migration to revert to Supabase Auth
// It's executed as part of the deployment process

const { createClient } = require("@supabase/supabase-js");

async function runMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Read the migration file
    const fs = require("fs");
    const path = require("path");
    const migrationPath = path.join(
      __dirname,
      "../migrations/20240927000001_revert_to_supabase_auth.sql",
    );
    const migrationSql = fs.readFileSync(migrationPath, "utf8");

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql: migrationSql });

    if (error) {
      console.error("Error running migration:", error);
      process.exit(1);
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

runMigration();
