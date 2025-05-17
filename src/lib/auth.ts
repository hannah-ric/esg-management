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
import { logger } from "./logger";

// Auth context types
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// Standardized error types for better error handling
export enum AuthErrorType {
  INVALID_CREDENTIALS = "invalid_credentials",
  EMAIL_IN_USE = "email_in_use",
  WEAK_PASSWORD = "weak_password",
  RATE_LIMITED = "rate_limited",
  NETWORK_ERROR = "network_error",
  UNAUTHORIZED = "unauthorized",
  UNKNOWN = "unknown"
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  code?: string;
  originalError?: unknown;
}

// Process Supabase errors into standardized format
function processAuthError(error: unknown): AuthError {
  let message = "An unexpected error occurred. Please try again.";
  let code: string | undefined = undefined;
  let status: number | undefined = undefined;

  if (typeof error === 'object' && error !== null) {
    const errAsObject = error as { message?: unknown; code?: unknown; status?: unknown };

    if (typeof errAsObject.message === 'string') {
      message = errAsObject.message;
    }
    if (typeof errAsObject.code === 'string') {
      code = errAsObject.code;
    }
    if (typeof errAsObject.status === 'number') {
      status = errAsObject.status;
    }
  }
  
  logger.error("Auth error:", { message, code, status, originalError: error });
  
  // Map error codes to our standardized types
  if (code === "invalid_credentials" || code === "23505" || code === "auth/invalid-email") {
    return {
      type: AuthErrorType.INVALID_CREDENTIALS,
      message: "The email or password you entered is incorrect.",
      code: code
    };
  } else if (code === "email_in_use" || code === "23505") {
    return {
      type: AuthErrorType.EMAIL_IN_USE,
      message: "This email is already in use. Please try another email or log in.",
      code: code
    };
  } else if (code === "weak_password") {
    return {
      type: AuthErrorType.WEAK_PASSWORD,
      message: "Please use a stronger password with at least 8 characters.",
      code: code
    };
  } else if (status === 429) {
    return {
      type: AuthErrorType.RATE_LIMITED,
      message: "Too many requests. Please try again later.",
      code: code
    };
  } else if (code === "auth/network-request-failed") {
    return {
      type: AuthErrorType.NETWORK_ERROR,
      message: "Network error. Please check your connection and try again.",
      code: code
    };
  } else if (status === 401 || code === "auth/unauthorized") {
    return {
      type: AuthErrorType.UNAUTHORIZED,
      message: "You are not authorized to perform this action.",
      code: code
    };
  }
  
  // Generic error for unknown cases
  return {
    type: AuthErrorType.UNKNOWN,
    message: message, // Use the extracted or default message
    code: code
  };
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
        const logMessage = "Session retrieval failed";
        let logStatus: number | undefined = undefined;
        let logCode: string | undefined = undefined;
        if (typeof error === 'object' && error !== null) {
          if ('status' in error && typeof (error as { status?: unknown }).status === 'number') logStatus = (error as { status: number }).status;
          if ('code' in error && typeof (error as { code?: unknown }).code === 'string') logCode = (error as { code: string }).code;
        }
        logger.error("Error getting initial session:", { 
          status: logStatus,
          code: logCode,
          message: logMessage 
        });
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

    const { data, error: signUpError } = await supabase.auth.signUp({
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

    if (signUpError) throw signUpError;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: processAuthError(error) };
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

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) throw signInError;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: processAuthError(error) };
  }
}

// Sign out
export async function signOut() {
  try {
    // Use mock auth in development
    if (isMockAuth()) {
      return mockSignOut();
    }

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;
    return { error: null };
  } catch (error) {
    return { error: processAuthError(error) };
  }
}

// Reset password
export async function resetPassword(email: string) {
  try {
    // Use mock auth in development
    if (isMockAuth()) {
      return mockResetPassword();
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (resetError) throw resetError;
    return { error: null };
  } catch (error) {
    return { error: processAuthError(error) };
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
      error: updateError,
    } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
      },
    });

    if (updateError) throw updateError;
    return { user, error: null };
  } catch (error) {
    return { user: null, error: processAuthError(error) };
  }
}
