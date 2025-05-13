import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { corsHeaders } from "@shared/cors.ts";

interface ClerkWebhookEvent {
  data: {
    id: string;
    first_name?: string;
    last_name?: string;
    email_addresses?: Array<{
      email_address: string;
      id: string;
      verification: {
        status: string;
      };
    }>;
    public_metadata?: Record<string, any>;
    private_metadata?: Record<string, any>;
    created_at: number;
  };
  object: string;
  type: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Verify the webhook signature (in production, you should validate the signature)
    // const svix_id = req.headers.get("svix-id") || "";
    // const svix_timestamp = req.headers.get("svix-timestamp") || "";
    // const svix_signature = req.headers.get("svix-signature") || "";
    // const webhook_secret = Deno.env.get("CLERK_WEBHOOK_SECRET") || "";

    // For now, we'll skip signature verification for simplicity

    const event = (await req.json()) as ClerkWebhookEvent;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process the webhook event based on its type
    switch (event.type) {
      case "user.created":
        await handleUserCreated(supabase, event.data);
        break;
      case "user.updated":
        await handleUserUpdated(supabase, event.data);
        break;
      case "user.deleted":
        await handleUserDeleted(supabase, event.data);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleUserCreated(
  supabase: any,
  userData: ClerkWebhookEvent["data"],
) {
  // Extract primary email
  const primaryEmail = userData.email_addresses?.find(
    (email) => email.verification.status === "verified",
  )?.email_address;

  if (!primaryEmail) {
    console.error("No verified email found for user");
    return;
  }

  // Create user in Supabase users table
  const { error } = await supabase.from("users").insert({
    id: userData.id,
    email: primaryEmail,
    full_name:
      `${userData.first_name || ""} ${userData.last_name || ""}`.trim(),
    company_name: userData.public_metadata?.company_name || null,
    created_at: new Date().toISOString(),
    is_admin: false,
  });

  if (error) {
    console.error("Error creating user in Supabase:", error);
    throw error;
  }
}

async function handleUserUpdated(
  supabase: any,
  userData: ClerkWebhookEvent["data"],
) {
  // Extract primary email
  const primaryEmail = userData.email_addresses?.find(
    (email) => email.verification.status === "verified",
  )?.email_address;

  if (!primaryEmail) {
    console.error("No verified email found for user");
    return;
  }

  // Update user in Supabase users table
  const { error } = await supabase
    .from("users")
    .update({
      email: primaryEmail,
      full_name:
        `${userData.first_name || ""} ${userData.last_name || ""}`.trim(),
      company_name: userData.public_metadata?.company_name || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userData.id);

  if (error) {
    console.error("Error updating user in Supabase:", error);
    throw error;
  }
}

async function handleUserDeleted(
  supabase: any,
  userData: ClerkWebhookEvent["data"],
) {
  // Delete user from Supabase users table
  const { error } = await supabase.from("users").delete().eq("id", userData.id);

  if (error) {
    console.error("Error deleting user from Supabase:", error);
    throw error;
  }
}
