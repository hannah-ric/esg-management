import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  getCompanyProfile,
  getMaterialityTopics,
  getESGPlan,
} from "@/lib/services";

interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  questionnaireData: Record<string, any>;
  materialityTopics: any[];
  esgPlan: any;
  setQuestionnaireData: (data: Record<string, any>) => void;
  setMaterialityTopics: (topics: any[]) => void;
  setEsgPlan: (plan: any) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultContext: AppContextType = {
  user: null,
  loading: true,
  questionnaireData: {},
  materialityTopics: [],
  esgPlan: null,
  setQuestionnaireData: () => {},
  setMaterialityTopics: () => {},
  setEsgPlan: () => {},
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
};

const AppContext = createContext<AppContextType>(defaultContext);

// Using a function declaration for better Fast Refresh compatibility
export function useAppContext() {
  return useContext(AppContext);
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [questionnaireData, setQuestionnaireData] = useState<
    Record<string, any>
  >({});
  const [materialityTopics, setMaterialityTopics] = useState<any[]>([]);
  const [esgPlan, setEsgPlan] = useState<any>(null);

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);

          // Load user data from Supabase
          try {
            const profile = await getCompanyProfile(session.user.id);
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

            const topics = await getMaterialityTopics(session.user.id);
            if (topics && topics.length > 0) {
              setMaterialityTopics(topics);
            }

            const plan = await getESGPlan(session.user.id);
            if (plan) {
              setEsgPlan(plan);
            }
          } catch (error) {
            console.error("Error loading user data:", error);
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setQuestionnaireData({});
          setMaterialityTopics([]);
          setEsgPlan(null);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, userData: any) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName,
          company_name: userData.companyName,
        },
      },
    });

    if (error) throw error;

    // Create user profile in public.users table
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: email,
        full_name: userData.fullName,
        company_name: userData.companyName,
      });

      if (profileError) throw profileError;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        questionnaireData,
        materialityTopics,
        esgPlan,
        setQuestionnaireData,
        setMaterialityTopics,
        setEsgPlan,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
