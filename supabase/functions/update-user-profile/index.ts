import { corsHeaders } from "@shared/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { handleError } from "@shared/error-handler";

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

    // Prepare update data for your 'users' table
    const userTableUpdateData: {
      first_name?: string;
      last_name?: string;
      company_name?: string;
      avatar_url?: string;
      updated_at?: string; // Will be added later
      auth_user_id?: string; // For insert case
      created_at?: string; // For insert case
    } = {};

    if (firstName !== undefined) userTableUpdateData.first_name = firstName;
    if (lastName !== undefined) userTableUpdateData.last_name = lastName;
    if (companyName !== undefined)
      userTableUpdateData.company_name = companyName;
    if (avatarUrl !== undefined) userTableUpdateData.avatar_url = avatarUrl;

    // Prepare user_metadata for auth.users update
    const userMetadataUpdate: Record<string, string | undefined> = {};
    if (firstName !== undefined) userMetadataUpdate.first_name = firstName;
    if (lastName !== undefined) userMetadataUpdate.last_name = lastName;
    if (companyName !== undefined)
      userMetadataUpdate.company_name = companyName;
    // avatar_url is not typically in user_metadata directly unless you customize it

    // Check if user exists before updating
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", userId)
      .single();

    let profile;
    let error = null;

    if (checkError) {
      if (checkError.code === "PGRST116") {
        // No rows returned
        console.log(
          `User with auth_user_id ${userId} not found, creating new profile`,
        );
        // Create new user profile
        const newUserData = {
          auth_user_id: userId,
          ...userTableUpdateData, // Use the typed object
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: newProfile, error: createError } = await supabase
          .from("users")
          .insert(newUserData)
          .select()
          .single();

        if (createError) {
          throw new Error(
            `Error creating user profile: ${createError.message}`,
          );
        }

        // Use the newly created profile
        profile = newProfile;
      } else {
        throw new Error(
          `Error checking for existing user: ${checkError.message}`,
        );
      }
    } else {
      // Update existing user profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from("users")
        .update({
          ...userTableUpdateData, // Use the typed object
          updated_at: new Date().toISOString(),
        })
        .eq("auth_user_id", userId)
        .select()
        .single();

      profile = updatedProfile;
      error = updateError;
    }

    if (error) {
      throw new Error(`Error updating user profile: ${error.message}`);
    }

    // Also update user metadata in auth.users
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: userMetadataUpdate, // Use the typed object
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
