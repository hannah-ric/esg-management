import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { isMockAuth, mockUser } from "@/lib/mock-auth";

export type Priority = "high" | "medium" | "low";
export type Effort = "high" | "medium" | "low";
export type Impact = "high" | "medium" | "low";
export type TaskStatus = "not_started" | "in_progress" | "completed" | "blocked";

export interface ImplementationTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string; // Or Date
  assignee?: User; // Assuming User type can be an assignee
}

export interface ImplementationPhase {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  tasks: ImplementationTask[];
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
  implementationDetails?: string; // Or a more structured type
  kpis?: string[]; // Key Performance Indicators
  phases?: ImplementationPhase[];
}

export interface MaterialityTopic {
  id: string;
  name: string;
  description?: string;
  stakeholderImportance: number;
  businessImpact: number;
  category: "environmental" | "social" | "governance";
  [key: string]: string | number | boolean | object | undefined;
}

export interface ESGPlan {
  id: string;
  title: string;
  description?: string;
  recommendations: ESGRecommendation[];
  implementationPhases?: ImplementationPhase[];
  overallGoals?: string;
  timeline?: string; // Or a more structured type
}

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  companyName?: string;
  metadata?: Record<string, unknown>;
}

// Define a more specific type for Questionnaire Data
interface CompanyProfileAnswers {
  companyName?: string;
  employeeCount?: string; // This might be a string like "1-50", "51-250", etc.
  companyType?: string;
  annualRevenue?: string;
  yearsInOperation?: string;
  operatingCountries?: string[];
}

interface IndustrySelectionAnswers {
  industry?: string;
  sector?: string;
  supplyChainExposure?: string[];
  keyStakeholders?: string[];
}

interface RegulatoryRequirementsAnswers {
  primaryRegion?: string;
  applicableRegulations?: string[];
  currentReporting?: string[];
  reportingFrequency?: string;
}

// Add other step answer types as needed...

export interface QuestionnaireAnswers {
  "company-profile"?: CompanyProfileAnswers;
  "industry-selection"?: IndustrySelectionAnswers;
  "regulatory-requirements"?: RegulatoryRequirementsAnswers;
  "esg-priorities"?: Record<string, unknown>;
  "esg-maturity"?: Record<string, unknown>;
  // Allow specific known keys to coexist with a general index signature
  [key: string]: CompanyProfileAnswers | IndustrySelectionAnswers | RegulatoryRequirementsAnswers | Record<string, unknown> | undefined;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  esgPlan: ESGPlan | null;
  setEsgPlan: React.Dispatch<React.SetStateAction<ESGPlan | null>>;
  materialityTopics: MaterialityTopic[];
  setMaterialityTopics: React.Dispatch<React.SetStateAction<MaterialityTopic[]>>;
  questionnaireData: QuestionnaireAnswers | null;
  setQuestionnaireData: React.Dispatch<React.SetStateAction<QuestionnaireAnswers | null>>;
  updateESGPlan: (plan: ESGPlan) => void;
  saveESGPlan: () => Promise<void>;
  updateMaterialityTopics: (topics: MaterialityTopic[]) => void;
  saveMaterialityTopics: () => Promise<void>;
  updateQuestionnaireData: (data: QuestionnaireAnswers | null) => void;
}

const AppContext = createContext<AppContextType>({
  user: null,
  loading: true,
  esgPlan: null,
  setEsgPlan: () => {},
  materialityTopics: [],
  setMaterialityTopics: () => {},
  questionnaireData: null,
  setQuestionnaireData: () => {},
  updateESGPlan: () => {},
  saveESGPlan: async () => {},
  updateMaterialityTopics: () => {},
  saveMaterialityTopics: async () => {},
  updateQuestionnaireData: () => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [esgPlan, setEsgPlan] = useState<ESGPlan | null>(null);
  const [materialityTopics, setMaterialityTopics] = useState<MaterialityTopic[]>([]);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireAnswers | null>(null);

  const updateESGPlan = (plan: ESGPlan) => {
    console.log("Updating ESG Plan:", plan);
    setEsgPlan(plan);
  };

  const saveESGPlan = async () => {
    console.log("Saving ESG Plan...", esgPlan);
  };

  const updateMaterialityTopics = (topics: MaterialityTopic[]) => {
    setMaterialityTopics(topics);
    console.log("Updated Materiality Topics in context");
  };

  const saveMaterialityTopics = async () => {
    console.log("Saving Materiality Topics...", materialityTopics);
  };

  const updateQuestionnaireData = (data: QuestionnaireAnswers | null) => {
    setQuestionnaireData(data);
    console.log("Updated Questionnaire Data in context");
  };

  useEffect(() => {
    let isMounted = true;

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
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error getting initial session:", error);
          setLoading(false);
          setUser(null);
        }
      }
    };

    getInitialSession();

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
        } finally {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider value={{
      user, 
      loading, 
      esgPlan, 
      setEsgPlan, 
      materialityTopics, 
      setMaterialityTopics,
      questionnaireData,
      setQuestionnaireData,
      updateESGPlan,
      saveESGPlan,
      updateMaterialityTopics,
      saveMaterialityTopics,
      updateQuestionnaireData
    }}>
      {children}
    </AppContext.Provider>
  );
};
