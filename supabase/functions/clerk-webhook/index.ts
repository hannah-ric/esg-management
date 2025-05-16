import { corsHeaders } from "@shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { handleError } from "@shared/error-handler.ts";
import { validateClerkConfig } from "@shared/clerk-config.ts";

// Import crypto for signature verification
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  // Validate Clerk configuration
  if (!validateClerkConfig()) {
    return handleError("Clerk API configuration is incomplete", 500);
  }

  try {
    // Verify webhook signature
    const svix_id = req.headers.get("svix-id") || "";
    const svix_timestamp = req.headers.get("svix-timestamp") || "";
    const svix_signature = req.headers.get("svix-signature") || "";

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing Svix headers:", {
        svix_id,
        svix_timestamp,
        svix_signature,
      });
      return new Response(JSON.stringify({ error: "Missing Svix headers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get the webhook secret
    const webhookSecret = Deno.env.get("CLERK_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // Get the webhook payload as text for verification
    const body = await req.text();

    // Verify the signature
    const isValid = await verifySignature({
      payload: body,
      secret: webhookSecret,
      svixId: svix_id,
      svixTimestamp: svix_timestamp,
      svixSignature: svix_signature,
    });

    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        },
      );
    }

    // Parse the payload
    const payload = JSON.parse(body);
    const { type, data } = payload;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different webhook events
    switch (type) {
      case "user.created": {
        // Create a new user record in the database
        const {
          id,
          email_addresses,
          first_name,
          last_name,
          image_url,
          public_metadata,
        } = data;
        const email = email_addresses?.[0]?.email_address;
        const companyName = public_metadata?.company_name || "";

        // Check if user already exists to avoid duplicates
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("id")
          .eq("id", id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          // PGRST116 is the error code for no rows returned
          console.error("Error checking for existing user:", checkError);
          throw checkError;
        }

        if (existingUser) {
          console.log(`User ${id} already exists, skipping creation`);
          break;
        }

        const { error } = await supabase.from("users").insert({
          id,
          email,
          first_name,
          last_name,
          avatar_url: image_url || "",
          company_name: companyName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_admin: false, // Default to non-admin
        });

        if (error) {
          console.error("Error creating user in database:", error);
          throw error;
        }

        console.log(`User ${id} created successfully`);
        break;
      }

      case "user.updated": {
        // Update the user record in the database
        const {
          id,
          email_addresses,
          first_name,
          last_name,
          image_url,
          public_metadata,
        } = data;
        const email = email_addresses?.[0]?.email_address;
        const companyName = public_metadata?.company_name || "";

        // Check if user exists before updating
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("id")
          .eq("id", id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error checking for existing user:", checkError);
          throw checkError;
        }

        if (!existingUser) {
          console.log(`User ${id} not found, creating instead of updating`);
          const { error } = await supabase.from("users").insert({
            id,
            email,
            first_name,
            last_name,
            avatar_url: image_url || "",
            company_name: companyName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_admin: false, // Default to non-admin
          });

          if (error) {
            console.error("Error creating user in database:", error);
            throw error;
          }

          console.log(`User ${id} created successfully`);
          break;
        }

        const { error } = await supabase
          .from("users")
          .update({
            email,
            first_name,
            last_name,
            avatar_url: image_url || "",
            company_name: companyName,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) {
          console.error("Error updating user in database:", error);
          throw error;
        }

        console.log(`User ${id} updated successfully`);
        break;
      }

      case "user.deleted": {
        // Delete the user record from the database
        const { id } = data;

        // First, check if the user exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", id)
          .single();

        if (!existingUser) {
          console.log(`User ${id} not found, skipping deletion`);
          break;
        }

        const { error } = await supabase.from("users").delete().eq("id", id);

        if (error) {
          console.error("Error deleting user from database:", error);
          throw error;
        }

        console.log(`User ${id} deleted successfully`);
        break;
      }

      default:
        // Log other webhook events
        console.log(`Received webhook event: ${type}`);
        break;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return handleError(error);
  }
});

// Helper function to verify webhook signature
async function verifySignature({
  payload,
  secret,
  svixId,
  svixTimestamp,
  svixSignature,
}: {
  payload: string;
  secret: string;
  svixId: string;
  svixTimestamp: string;
  svixSignature: string;
}): Promise<boolean> {
  try {
    // Convert the secret to a Uint8Array
    const secretBytes = new TextEncoder().encode(secret);
    const secretKey = await crypto.subtle.importKey(
      "raw",
      secretBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    // Create the message to verify
    const message = `${svixId}.${svixTimestamp}.${payload}`;
    const messageBytes = new TextEncoder().encode(message);

    // Parse the signature
    const signatures = svixSignature.split(" ");
    for (const signature of signatures) {
      const [version, signatureHex] = signature.split(",");
      if (version !== "v1") continue;

      // Convert the signature from hex to Uint8Array
      const signatureBytes = hexToUint8Array(signatureHex);

      // Verify the signature
      const isValid = await crypto.subtle.verify(
        "HMAC",
        secretKey,
        signatureBytes,
        messageBytes,
      );

      if (isValid) return true;
    }

    return false;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

// Helper function to convert hex string to Uint8Array
function hexToUint8Array(hex: string): Uint8Array {
  const pairs = hex.match(/[\da-f]{2}/gi) || [];
  const bytes = pairs.map((pair) => parseInt(pair, 16));
  return new Uint8Array(bytes);
}
