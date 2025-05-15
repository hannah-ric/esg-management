import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { isMockAuth, mockUser } from "../lib/mock-auth";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

// Define types
export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  publicMetadata?: Record<string, any>;
}

export interface MaterialityTopic {
  id: string;
  name: string;
  category: string;
  stakeholderImportance: number;
  businessImpact: number;
  description?: string;
}

// Exporting enum-like types
export type Priority = "high" | "medium" | "low";
export type Effort = "high" | "medium" | "low";
export type Impact = "high" | "medium" | "low";
export type TaskStatus = "not_started" | "in_progress" | "completed";

export interface ESGPlan {
  id: string;
  title: string;
  description: string;
  recommendations: ESGRecommendation[];
  implementationPhases: ImplementationPhase[];
}

export interface ESGRecommendation {
  id: string;
  title: string;
  description: string;
  framework: string;
  indicator: string;
  priority: Priority;
  effort: Effort;
  impact: Impact;
}

export interface ImplementationPhase {
  id: string;
  title: string;
  description: string;
  duration: string;
  tasks: ImplementationTask[];
}

export interface ImplementationTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
}

export interface QuestionnaireData {
  [key: string]: any;
}

// Define context type
interface AppContextType {
  user: User | null;
  loading: boolean;
  questionnaireData: QuestionnaireData;
  materialityTopics: MaterialityTopic[];
  esgPlan: ESGPlan | null;
  updateQuestionnaireData: (data: QuestionnaireData) => void;
  updateMaterialityTopics: (topics: MaterialityTopic[]) => void;
  updateESGPlan: (plan: ESGPlan | null) => void;
  saveQuestionnaireData: () => Promise<void>;
  saveMaterialityTopics: () => Promise<void>;
  saveESGPlan: () => Promise<void>;
  loadUserData: () => Promise<void>;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<{
    user: User | null;
    session: Session | null;
    loading: boolean;
  }>({
    user: null,
    session: null,
    loading: true,
  });

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>(
    {},
  );
  const [materialityTopics, setMaterialityTopics] = useState<
    MaterialityTopic[]
  >([]);
  const [esgPlan, setESGPlan] = useState<ESGPlan | null>(null);

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
        publicMetadata: mockUser.user_metadata,
      });
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (isMounted) {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              firstName: session.user.user_metadata?.first_name,
              lastName: session.user.user_metadata?.last_name,
              imageUrl: "",
              publicMetadata: session.user.user_metadata,
            });
          }
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error getting initial session:", error);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            firstName: session.user.user_metadata?.first_name,
            lastName: session.user.user_metadata?.last_name,
            imageUrl: "",
            publicMetadata: session.user.user_metadata,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load user data from Supabase when user changes
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (user && !loading) {
      // Add a small delay to ensure auth state has settled
      timeoutId = setTimeout(() => {
        loadUserData();
      }, 100);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user?.id, loading]);

  // Function to load user data from Supabase
  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let hasErrors = false;

      // Load questionnaire data
      try {
        const { data: questionnaireData, error: questionnaireError } =
          await supabase
            .from("questionnaire_data")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (questionnaireError && questionnaireError.code !== "PGRST116") {
          console.error("Error loading questionnaire data:", questionnaireError);
          hasErrors = true;
        } else if (questionnaireData) {
          setQuestionnaireData(questionnaireData.data || {});
        }
      } catch (err) {
        console.error("Failed to load questionnaire data:", err);
        hasErrors = true;
      }

      // Load materiality topics
      try {
        const { data: topicsData, error: topicsError } = await supabase
          .from("materiality_topics")
          .select("*")
          .eq("user_id", user.id);

        if (topicsError) {
          console.error("Error loading materiality topics:", topicsError);
          hasErrors = true;
        } else if (topicsData) {
          setMaterialityTopics(topicsData);
        }
      } catch (err) {
        console.error("Failed to load materiality topics:", err);
        hasErrors = true;
      }

      // Load ESG plan
      try {
        const { data: planData, error: planError } = await supabase
          .from("esg_plans")
          .select(
            "*, recommendations:esg_recommendations(*), implementation_phases:esg_plan_implementation_phases(*, tasks:esg_plan_implementation_tasks(*))",
          )
          .eq("user_id", user.id)
          .single();

        if (planError && planError.code !== "PGRST116") {
          console.error("Error loading ESG plan:", planError);
          hasErrors = true;
        } else if (planData) {
          setESGPlan({
            id: planData.id,
            title: planData.title,
            description: planData.description,
            recommendations: planData.recommendations.map((rec: any) => ({
              id: rec.id,
              title: rec.title,
              description: rec.description,
              framework: rec.framework,
              indicator: rec.indicator,
              priority: rec.priority,
              effort: rec.effort,
              impact: rec.impact,
            })),
            implementationPhases: planData.implementation_phases.map(
              (phase: any) => ({
                id: phase.id,
                title: phase.title,
                description: phase.description,
                duration: phase.duration,
                tasks: phase.tasks.map((task: any) => ({
                  id: task.id,
                  title: task.title,
                  description: task.description,
                  status: task.status,
                })),
              }),
            ),
          });
        }
      } catch (err) {
        console.error("Failed to load ESG plan:", err);
        hasErrors = true;
      }

      if (hasErrors) {
        // Notify the user but don't block the app
        console.warn("Some data could not be loaded completely");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to update questionnaire data
  const updateQuestionnaireData = (data: QuestionnaireData) => {
    setQuestionnaireData((prev) => ({ ...prev, ...data }));
  };

  // Function to update materiality topics
  const updateMaterialityTopics = (topics: MaterialityTopic[]) => {
    setMaterialityTopics(topics);
  };

  // Function to update ESG plan
  const updateESGPlan = (plan: ESGPlan | null) => {
    setESGPlan(plan);
  };

  // Function to save questionnaire data to Supabase
  const saveQuestionnaireData = async (): Promise<void> => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("questionnaire_data")
        .upsert(
          {
            user_id: user.id,
            data: questionnaireData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        )
        .select();

      if (error) {
        console.error("Error saving questionnaire data:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error saving questionnaire data:", error);
      throw error;
    }
  };

  // Function to save materiality topics to Supabase
  const saveMaterialityTopics = async (): Promise<void> => {
    if (!user) return;

    try {
      // First delete existing topics for this user
      const { error: deleteError } = await supabase
        .from("materiality_topics")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Error deleting existing topics:", deleteError);
        throw deleteError;
      }

      // Then insert new topics
      if (materialityTopics.length > 0) {
        const topicsWithUserId = materialityTopics.map((topic) => ({
          ...topic,
          user_id: user.id,
        }));

        const { data, error } = await supabase
          .from("materiality_topics")
          .insert(topicsWithUserId)
          .select();

        if (error) {
          console.error("Error saving materiality topics:", error);
          throw error;
        }
      }
    } catch (error) {
      console.error("Error saving materiality topics:", error);
      throw error;
    }
  };

  // Function to save ESG plan to Supabase
  const saveESGPlan = async (): Promise<void> => {
    if (!user || !esgPlan) return;

    try {
      // Start a transaction
      const { error: transactionError } = await supabase.rpc(
        "save_esg_plan_transaction",
        {
          p_user_id: user.id,
          p_plan_id: esgPlan.id,
          p_title: esgPlan.title,
          p_description: esgPlan.description,
          p_recommendations: JSON.stringify(esgPlan.recommendations),
          p_implementation_phases: JSON.stringify(esgPlan.implementationPhases),
        },
      );

      if (transactionError) {
        console.error("Error saving ESG plan:", transactionError);
        throw transactionError;
      }
    } catch (error) {
      console.error("Error saving ESG plan:", error);
      throw error;
    }
  };

  const contextValue: AppContextType = {
    user,
    loading,
    questionnaireData,
    materialityTopics,
    esgPlan,
    updateQuestionnaireData,
    updateMaterialityTopics,
    updateESGPlan,
    saveQuestionnaireData,
    saveMaterialityTopics,
    saveESGPlan,
    loadUserData,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// Create hook for using the context
export const useAppContext = function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
