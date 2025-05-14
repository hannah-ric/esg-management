import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { User, Session } from "@supabase/supabase-js";
import {
  isMockAuth,
  mockSignIn,
  mockSignOut,
  mockSignUp,
  mockResetPassword,
  mockUpdateProfile,
} from "./mock-auth";

// Auth context types
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// Hook for getting the current auth state
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setAuthState({
          user: session?.user || null,
          session: session || null,
          loading: false,
        });
      } catch (error) {
        console.error("Error getting initial session:", error);
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user || null,
        session: session || null,
        loading: false,
      });
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return authState;
}

// Sign up with email and password
export async function signUp({
  email,
  password,
  firstName,
  lastName,
  companyName,
}: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}) {
  try {
    // Use mock auth in development
    if (isMockAuth()) {
      return mockSignUp();
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || "",
          last_name: lastName || "",
          company_name: companyName || "",
        },
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error signing up:", error);
    return { data: null, error };
  }
}

// Sign in with email and password
export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    // Use mock auth in development
    if (isMockAuth()) {
      return mockSignIn();
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error signing in:", error);
    return { data: null, error };
  }
}

// Sign out
export async function signOut() {
  try {
    // Use mock auth in development
    if (isMockAuth()) {
      return mockSignOut();
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error("Error signing out:", error);
    return { error };
  }
}

// Reset password
export async function resetPassword(email: string) {
  try {
    // Use mock auth in development
    if (isMockAuth()) {
      return mockResetPassword();
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return { error };
  }
}

// Update user profile
export async function updateProfile({
  firstName,
  lastName,
  companyName,
}: {
  firstName?: string;
  lastName?: string;
  companyName?: string;
}) {
  try {
    // Use mock auth in development
    if (isMockAuth()) {
      return mockUpdateProfile();
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
      },
    });

    if (error) throw error;
    return { user, error: null };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { user: null, error };
  }
}
