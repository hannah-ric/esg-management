import { supabase } from "./supabase";
import { logger } from "./logger";
import {
  getFrameworkRecommendations,
  getResourceRecommendations,
  // AIAssistantResponse // Unused
} from "./ai-services";
import type { ESGDataPoint, ESGFrameworkMapping } from "@/lib/esg-data-services";
import type { ESGPlan, MaterialityTopic, ESGRecommendation } from "@/components/AppContext";

// --- Types for analyzeExternalContent response ---
export interface AnalyzedContentDataPoint {
    value: string;
    id?: string;
    resource_id?: string;
    metric_id?: string;
    context?: string;
    confidence?: number;
    source?: string;
    framework_id?: string;
    disclosure_id?: string;
    is_edited?: boolean;
    reporting_year?: string;
}
export interface AnalyzedContentFrameworkMapping extends Partial<ESGFrameworkMapping> {
    framework_id: string;
    disclosure_id: string;
}
export interface AnalyzedContentESGData {
    dataPoints?: Record<string, AnalyzedContentDataPoint>; 
    mappings?: Record<string, AnalyzedContentFrameworkMapping[]>; 
}
export interface AnalyzedContentResult {
  id?: string;
  title: string;
  url: string;
  category: string;
  type: string;
  fileType?: string;
  description: string;
  tags: string[];
  rawContent?: string;
  esgData?: AnalyzedContentESGData;
}
// --- End Types for analyzeExternalContent ---

// Define return type for generateAIRecommendations
interface FrameworkRecommendationsAI {
  recommendations: { title: string; description: string; framework: string; indicator: string; priority: string; effort: string; impact: string }[]; 
}
interface ResourceRecommendationsAI {
  [key: string]: unknown;
}
export interface EnhancedPlanData {
  frameworks: FrameworkRecommendationsAI | string | null; 
  resources: ResourceRecommendationsAI | string | null;  
}

/**
 * Analyze external content via URL to enhance ESG plan
 * @param url URL to analyze
 * @returns Analyzed content data
 */
export async function analyzeExternalContent(url: string): Promise<{ success: boolean; data?: AnalyzedContentResult | null; error?: string; }> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-analyze-esg-content",
      {
        body: { url },
      },
    );

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (err) {
    logger.error("Error analyzing URL", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to analyze the URL",
    };
  }
}

/**
 * Search for resources in the library
 * @param searchQuery Search query string
 * @returns Array of matching resources
 */
export async function searchResourceLibrary(searchQuery: string) {
  try {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    logger.error("Error searching resources", err);
    return { success: false, error: "Failed to search resources", data: [] };
  }
}

/**
 * Generate AI recommendations for ESG plan
 * @param companyName Company name
 * @param industry Industry sector
 * @param materialityTopics Array of materiality topics
 * @param esgPlan Existing ESG plan data
 * @returns AI generated recommendations
 */
export async function generateAIRecommendations(
  companyName: string,
  industry: string,
  materialityTopics: Partial<MaterialityTopic>[],
  esgPlan: Partial<ESGPlan>,
  existingRecommendations?: Partial<ESGRecommendation>[],
): Promise<{ success: boolean; data: EnhancedPlanData | null; error?: string }> {
  try {
    logger.info("Generating AI recommendations", {
      companyName,
      industry,
      materialityTopics,
      esgPlan,
      existingRecommendations,
    });

    // Prepare company profile data
    const companyProfile = {
      companyName: companyName || "Your Company",
      industry: industry || "General",
      size: "Medium Enterprise",
      region: "Global",
    };

    // Get AI-powered framework recommendations
    const frameworkResponse = await getFrameworkRecommendations(
      companyProfile,
      materialityTopics || [],
    );

    if (!frameworkResponse.success) {
      throw new Error(
        frameworkResponse.error || "Failed to get framework recommendations",
      );
    }

    // Get AI-powered resource recommendations if esgPlan is available
    let resourceResponse = null;
    if (esgPlan) {
      resourceResponse = await getResourceRecommendations(
        esgPlan,
        companyProfile,
        materialityTopics || [],
      );

      if (!resourceResponse.success) {
        logger.warn(
          "Failed to get resource recommendations",
          resourceResponse.error,
        );
        // Continue execution even if resource recommendations fail
      }
    }

    return {
      success: true,
      data: {
        frameworks: frameworkResponse.content || 
          (frameworkResponse.data && typeof frameworkResponse.data === 'object' &&
          'recommendations' in frameworkResponse.data ? 
          frameworkResponse.data as unknown as FrameworkRecommendationsAI : 
          null),
        resources: resourceResponse?.success
          ? resourceResponse.content || resourceResponse.data as ResourceRecommendationsAI
          : null,
      },
    };
  } catch (err) {
    logger.error("Error generating AI recommendations", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to generate AI recommendations",
      data: null,
    };
  }
}
