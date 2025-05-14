import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  getCompanyProfile,
  getMaterialityTopics,
  getESGPlan,
} from "@/lib/services";
import { ClerkProvider, useUser, useClerk } from "@clerk/clerk-react";
import { createClerkUser, getClerkUser, SignUpData } from "@/lib/clerk-service";

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  publicMetadata?: Record<string, any>;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  questionnaireData: Record<string, any>;
  materialityTopics: any[];
  esgPlan: any;
  isAdmin: boolean;
  setQuestionnaireData: (data: Record<string, any>) => void;
  setMaterialityTopics: (topics: any[]) => void;
  setEsgPlan: (plan: any) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

const defaultContext: AppContextType = {
  user: null,
  loading: true,
  questionnaireData: {},
  materialityTopics: [],
  esgPlan: null,
  isAdmin: false,
  setQuestionnaireData: () => {},
  setMaterialityTopics: () => {},
  setEsgPlan: () => {},
  signIn: async () => {},
  signUp: async (userData: SignUpData) => {},
  signOut: async () => {},
  checkAdminStatus: async () => false,
};

const AppContext = createContext<AppContextType>(defaultContext);

// Using a function declaration for better Fast Refresh compatibility
export function useAppContext() {
  return useContext(AppContext);
}

// Inner provider that uses Clerk hooks
const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser();
  const { signIn: clerkSignIn, signOut: clerkSignOut } = useClerk();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [questionnaireData, setQuestionnaireData] = useState<
    Record<string, any>
  >({});
  const [materialityTopics, setMaterialityTopics] = useState<any[]>([]);
  const [esgPlan, setEsgPlan] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Effect to sync Clerk user with our app state
  useEffect(() => {
    if (clerkIsLoaded) {
      if (clerkUser) {
        // Map Clerk user to our User format
        setUser({
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          firstName: clerkUser.firstName || undefined,
          lastName: clerkUser.lastName || undefined,
          imageUrl: clerkUser.imageUrl,
          publicMetadata: clerkUser.publicMetadata as Record<string, any>,
        });
      } else {
        setUser(null);
        setQuestionnaireData({});
        setMaterialityTopics([]);
        setEsgPlan(null);
      }
      setLoading(false);
    }
  }, [clerkUser, clerkIsLoaded]);

  // Load user data from Supabase when user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          const profile = await getCompanyProfile(user.id);
          if (profile) {
            setQuestionnaireData({
              "company-profile": {
                companyName: profile.company_name,
                employeeCount: profile.employee_count,
                companyType: profile.company_type,
                annualRevenue: profile.annual_revenue,
              },
              "industry-selection": {
                industry: profile.industry,
              },
              "regulatory-requirements": {
                primaryRegion: profile.primary_region,
                currentReporting: profile.current_reporting,
                applicableRegulations: profile.applicable_regulations,
              },
            });
          }

          const topics = await getMaterialityTopics(user.id);
          if (topics && topics.length > 0) {
            setMaterialityTopics(topics);
          }

          const plan = await getESGPlan(user.id);
          if (plan) {
            setEsgPlan(plan);
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
    };

    loadUserData();
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    try {
      await clerkSignIn.create({
        identifier: email,
        password,
      });
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signUp = async (userData: SignUpData) => {
    try {
      // Create user in Clerk via our edge function
      await createClerkUser(userData);

      // After successful signup, sign in the user
      await signIn(userData.email, userData.password);
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await clerkSignOut();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const checkAdminStatus = async () => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const adminStatus = data?.is_admin || false;
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (err) {
      console.error("Error checking admin status:", err);
      return false;
    }
  };

  // Check admin status whenever user changes
  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        questionnaireData,
        materialityTopics,
        esgPlan,
        isAdmin,
        setQuestionnaireData,
        setMaterialityTopics,
        setEsgPlan,
        signIn,
        signUp,
        signOut,
        checkAdminStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Outer provider that wraps with ClerkProvider
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!clerkPubKey) {
    console.error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable");
    return <div>Error: Missing Clerk configuration</div>;
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AppContextProvider>{children}</AppContextProvider>
    </ClerkProvider>
  );
};
