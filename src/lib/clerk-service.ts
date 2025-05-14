import { supabase } from "./supabase";

export interface ClerkUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
  publicMetadata?: Record<string, any>;
  privateMetadata?: Record<string, any>;
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
    // Validate required fields
    if (!userData.email) {
      throw new Error("Email is required");
    }

    if (!userData.password) {
      throw new Error("Password is required");
    }

    // Ensure firstName and lastName are at least empty strings
    const sanitizedUserData = {
      ...userData,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
    };

    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-create-clerk-user",
      {
        body: sanitizedUserData,
      },
    );

    if (error) {
      console.error("Error from edge function:", error);
      throw new Error(error.message || "Failed to create user");
    }

    if (!data || !data.user) {
      throw new Error("Invalid response from server");
    }

    return mapClerkUser(data.user);
  } catch (error: any) {
    console.error("Error creating Clerk user:", error);
    throw new Error(
      error.message || "An unexpected error occurred during signup",
    );
  }
}

// Get a user from Clerk by ID
export async function getClerkUser(userId: string): Promise<ClerkUser> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-get-clerk-user",
      {
        body: { userId },
      },
    );

    if (error) throw error;
    if (!data || !data.user) {
      throw new Error("User not found");
    }
    return mapClerkUser(data.user);
  } catch (error) {
    console.error("Error getting Clerk user:", error);
    throw error;
  }
}

// Update a user in Clerk
export async function updateClerkUser(
  userId: string,
  userData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    publicMetadata: Record<string, any>;
    privateMetadata: Record<string, any>;
  }>,
): Promise<ClerkUser> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Prepare the update data
    const updateData: Record<string, any> = { userId };

    if (userData.firstName !== undefined)
      updateData.firstName = userData.firstName;
    if (userData.lastName !== undefined)
      updateData.lastName = userData.lastName;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.companyName !== undefined)
      updateData.companyName = userData.companyName;
    if (userData.publicMetadata !== undefined)
      updateData.publicMetadata = userData.publicMetadata;
    if (userData.privateMetadata !== undefined)
      updateData.privateMetadata = userData.privateMetadata;

    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-update-clerk-user",
      {
        body: updateData,
      },
    );

    if (error) throw error;
    if (!data || !data.user) {
      throw new Error("Failed to update user");
    }
    return mapClerkUser(data.user);
  } catch (error) {
    console.error("Error updating Clerk user:", error);
    throw error;
  }
}

// Delete a user in Clerk
export async function deleteClerkUser(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-delete-clerk-user",
      {
        body: { userId },
      },
    );

    if (error) throw error;
    return data.success;
  } catch (error) {
    console.error("Error deleting Clerk user:", error);
    throw error;
  }
}

// Set profile image for a user in Clerk
export async function setClerkProfileImage(
  userId: string,
  imageUrl: string,
): Promise<ClerkUser> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-set-clerk-profile-image",
      {
        body: { userId, imageUrl },
      },
    );

    if (error) throw error;
    return mapClerkUser(data.user);
  } catch (error) {
    console.error("Error setting profile image:", error);
    throw error;
  }
}

// Get user organization memberships
export async function getClerkUserOrganizations(
  userId: string,
  limit = 10,
  offset = 0,
): Promise<OrganizationMembership[]> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-get-clerk-user-organizations",
      {
        body: { userId, limit, offset },
      },
    );

    if (error) throw error;
    return data.data.map((membership: any) => ({
      id: membership.id,
      role: membership.role,
      roleName: membership.role_name,
      permissions: membership.permissions,
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        membersCount: membership.organization.members_count,
      },
    }));
  } catch (error) {
    console.error("Error getting user organizations:", error);
    throw error;
  }
}

// Verify a user's password
export async function verifyClerkUserPassword(
  userId: string,
  password: string,
): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-verify-clerk-user-password",
      {
        body: { userId, password },
      },
    );

    if (error) throw error;
    return data.verified === true;
  } catch (error) {
    console.error("Error verifying user password:", error);
    throw error;
  }
}

// Helper function to map Clerk user data to our format
function mapClerkUser(clerkUser: any): ClerkUser {
  if (!clerkUser) {
    throw new Error("Invalid user data received from Clerk");
  }

  return {
    id: clerkUser.id,
    firstName: clerkUser.first_name || "",
    lastName: clerkUser.last_name || "",
    email: clerkUser.email_addresses?.[0]?.email_address || "",
    // Prefer image_url as profile_image_url is deprecated
    imageUrl: clerkUser.image_url || clerkUser.profile_image_url || "",
    publicMetadata: clerkUser.public_metadata || {},
    privateMetadata: clerkUser.private_metadata || {},
  };
}

interface OrganizationMembership {
  id: string;
  role: string;
  roleName: string;
  permissions: string[];
  organization: {
    id: string;
    name: string;
    slug: string;
    membersCount: number;
  };
}
