// ESM test file for Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}


// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test function
async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test subscription_plans table
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .limit(5);
    
    if (plansError) {
      console.error('Error fetching plans:', plansError.message);
    } else {
      console.log(`Successfully fetched ${plans?.length || 0} subscription plans.`);
      if (plans && plans.length > 0) {
        console.log('Sample plan data:', JSON.stringify(plans[0], null, 2));
      }
    }
    
    // Test resources table
    const { data: resources, error: resourcesError } = await supabase
      .from('resources')
      .select('*')
      .limit(5);
    
    if (resourcesError) {
      console.error('Error fetching resources:', resourcesError.message);
    } else {
      console.log(`Successfully fetched ${resources?.length || 0} resources.`);
      if (resources && resources.length > 0) {
        console.log('Sample resource data:', JSON.stringify(resources[0], null, 2));
      }
    }
    
    console.log('Supabase connection test completed.');
  } catch (error) {
    console.error('Unexpected error during test:', error);
  }
}

// Run the test
testSupabaseConnection(); 