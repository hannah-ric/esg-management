import { supabase } from "./lib/supabase";

// Simple function to test the Supabase connection
async function testSupabaseConnection() {
  try {
    console.log("Testing Supabase connection...");
    
    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Authentication error:", userError.message);
      console.log("Anonymous access test:");
    } else if (user) {
      console.log("Currently authenticated as:", user.email);
    } else {
      console.log("No authenticated user found. Testing public access.");
    }
    
    // Try to query the subscription_plans table (which should have public read access)
    const { data: plans, error: plansError } = await supabase
      .from("subscription_plans")
      .select("*")
      .limit(5);
    
    if (plansError) {
      console.error("Error fetching plans:", plansError.message);
      if (plansError.code === "PGRST301") {
        console.error("This might be a permission issue - make sure the table has appropriate RLS policies.");
      }
    } else {
      console.log(`Successfully fetched ${plans?.length || 0} subscription plans.`);
      console.log("First plan (if any):", plans && plans.length > 0 ? plans[0] : "No plans found");
    }
    
    // Test another public table (resources)
    const { data: resources, error: resourcesError } = await supabase
      .from("resources")
      .select("*")
      .limit(5);
    
    if (resourcesError) {
      console.error("Error fetching resources:", resourcesError.message);
    } else {
      console.log(`Successfully fetched ${resources?.length || 0} resources.`);
    }
    
    console.log("Supabase connection test completed.");
  } catch (error) {
    console.error("Unexpected error during Supabase test:", error);
  }
}

// Run the test
testSupabaseConnection(); 