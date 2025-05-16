import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { isMockAuth, mockUser } from "../lib/mock-auth";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  companyName?: string;
  metadata?: Record<string, any>;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
}

const AppContext = createContext<AppContextType>({
  user: null,
  loading: true,
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect to sync Supabase user with our app state
  useEffect(() => {
    let isMounted = true;

    // Use mock user in development
    if (isMockAuth()) {
      setUser({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.user_metadata?.first_name,
        lastName: mockUser.user_metadata?.last_name,
        imageUrl: "",
        companyName: mockUser.user_metadata?.company_name,
        metadata: mockUser.user_metadata,
      });
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error retrieving auth session:", error.message);
          throw error;
        }

        if (isMounted) {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              firstName: session.user.user_metadata?.first_name,
              lastName: session.user.user_metadata?.last_name,
              imageUrl: session.user.user_metadata?.avatar_url || "",
              companyName: session.user.user_metadata?.company_name,
              metadata: session.user.user_metadata,
            });
          } else {
            // No active session found
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error getting initial session:", error);
          // Still set loading to false to prevent infinite loading state
          setLoading(false);
          // Keep user as null when there's an error
          setUser(null);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        try {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              firstName: session.user.user_metadata?.first_name,
              lastName: session.user.user_metadata?.last_name,
              imageUrl: session.user.user_metadata?.avatar_url || "",
              companyName: session.user.user_metadata?.company_name,
              metadata: session.user.user_metadata,
            });
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error processing auth state change:", error);
          // Keep previous user state on error to prevent disruption
        } finally {
          setLoading(false);
        }
      }
    });

    // Cleanup subscription
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider value={{ user, loading }}>
      {children}
    </AppContext.Provider>
  );
};
