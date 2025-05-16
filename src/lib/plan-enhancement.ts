import { supabase } from "./supabase";
import { logger } from "./logger";
import {
  getFrameworkRecommendations,
  getResourceRecommendations,
} from "./ai-services";

/**
 * Analyze external content via URL to enhance ESG plan
 * @param url URL to analyze
 * @returns Analyzed content data
 */
export async function analyzeExternalContent(url: string) {
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
  companyName: string = "",
  industry: string = "",
  materialityTopics: any[] = [],
  esgPlan: any = null,
) {
  try {
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
        frameworks: frameworkResponse.content || frameworkResponse.data,
        resources: resourceResponse?.success
          ? resourceResponse.content || resourceResponse.data
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
