import { corsHeaders } from "@shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { handleError } from "@shared/error-handler.ts";

interface UpdateProfileRequest {
  userId: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  avatarUrl?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get update data from request body
    const { userId, firstName, lastName, companyName, avatarUrl } =
      (await req.json()) as UpdateProfileRequest;

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Prepare update data
    const updateData: Record<string, any> = {};

    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (companyName !== undefined) updateData.company_name = companyName;
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

    // Update user profile in database
    const { data: profile, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("auth_user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating user profile: ${error.message}`);
    }

    // Also update user metadata in auth.users
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          company_name: companyName,
        },
      },
    );

    if (authError) {
      console.error("Error updating auth user metadata:", authError);
      // Continue anyway as the main profile was updated
    }

    return new Response(JSON.stringify({ profile }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return handleError(error);
  }
});
