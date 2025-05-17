import { ESGRecommendation, ImplementationPhase } from "@/components/AppContext";

export interface ESGPlan {
  id: string;
  title: string;
  description?: string;
  recommendations: ESGRecommendation[];
  implementationPhases?: ImplementationPhase[];
  overallGoals?: string;
  timeline?: string; // Or a more structured type
  // Add an index signature to make compatible with Record<string, unknown>
  [key: string]: string | ESGRecommendation[] | ImplementationPhase[] | undefined | object;
} 