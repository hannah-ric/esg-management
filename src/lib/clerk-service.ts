import { supabase } from "./supabase";

export interface ClerkUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
  publicMetadata?: Record<string, any>;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Create a new user in Clerk
export async function createClerkUser(
  userData: SignUpData,
): Promise<ClerkUser> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-create-clerk-user",
      {
        body: userData,
      },
    );

    if (error) throw error;
    return mapClerkUser(data.user);
  } catch (error) {
    console.error("Error creating Clerk user:", error);
    throw error;
  }
}

// Get a user from Clerk by ID
export async function getClerkUser(userId: string): Promise<ClerkUser> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-get-clerk-user",
      {
        body: { userId },
      },
    );

    if (error) throw error;
    return mapClerkUser(data.user);
  } catch (error) {
    console.error("Error getting Clerk user:", error);
    throw error;
  }
}

// Helper function to map Clerk user data to our format
function mapClerkUser(clerkUser: any): ClerkUser {
  return {
    id: clerkUser.id,
    firstName: clerkUser.first_name,
    lastName: clerkUser.last_name,
    email: clerkUser.email_addresses?.[0]?.email_address,
    imageUrl: clerkUser.image_url || clerkUser.profile_image_url,
    publicMetadata: clerkUser.public_metadata,
  };
}
