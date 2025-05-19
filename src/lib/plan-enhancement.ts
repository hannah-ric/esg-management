import { supabase } from "./supabase";

export interface AnalyzedContentDataPoint {
  metric_id: string;
  value: string;
  framework_id?: string | null;
  disclosure_id?: string | null;
  confidence?: number | null;
  context?: string | null;
  is_edited?: boolean | null;
}

export interface AnalyzedContentFrameworkMapping {
  framework_id: string;
  disclosure_id: string;
}

export interface AnalyzedContentESGData {
  dataPoints: Record<string, AnalyzedContentDataPoint>;
  mappings: Record<string, AnalyzedContentFrameworkMapping[]>;
}

export interface AnalyzedContentResult {
  id?: string;
  title?: string;
  url?: string;
  rawContent?: string;
  fileType?: string;
  esgData?: AnalyzedContentESGData;
}

export interface EnhancedPlanData {
  recommendations: string[];
}

/**
 * Analyzes external content using the Diffbot API via Edge Function
 * @param url The URL to analyze
 * @returns Analysis results from Diffbot
 */
export async function analyzeExternalContent(url: string) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-analyze-content",
      {
        body: { url },
      },
    );

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Error analyzing external content:", error);
    throw error;
  }
}

/**
 * Searches the resource library for relevant content
 * @param query Search query
 * @param filters Optional filters
 * @returns Search results
 */
export async function searchResourceLibrary(
  query: string,
  filters?: Record<string, any>,
) {
  try {
    // Implementation would depend on your backend search functionality
    // This is a placeholder
    return { results: [], count: 0 };
  } catch (error) {
    console.error("Error searching resource library:", error);
    throw error;
  }
}

/**
 * Generates AI recommendations based on user data
 * @param userData User data to base recommendations on
 * @returns AI-generated recommendations
 */
export async function generateAIRecommendations(
  userData: Record<string, any>,
) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-esg-ai-assistant",
      {
        body: {
          prompt:
            "Suggest enhancements or additional ESG initiatives based on the provided user data.",
          context: { userData },
          task: "plan-enhancement",
          maxTokens: 800,
        },
      },
    );

    if (error) throw error;

    let recommendations: string[] = [];
    if (data && typeof data.content === "string") {
      try {
        const parsed = JSON.parse(data.content);
        if (Array.isArray(parsed)) {
          recommendations = parsed;
        } else if (Array.isArray(parsed.recommendations)) {
          recommendations = parsed.recommendations;
        } else {
          recommendations = [data.content];
        }
      } catch (_) {
        recommendations = [data.content];
      }
    }

    return { recommendations, success: true };
  } catch (error) {
    console.error("Error generating AI recommendations:", error);
    return { recommendations: [], success: false, error: String(error) };
  }
}
