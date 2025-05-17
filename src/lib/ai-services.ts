import { supabase } from "./supabase";
import { logger } from "./logger";

export interface AIAssistantResponse {
  content: string;
  task: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  error?: string;
  success?: boolean;
  data?: Record<string, unknown>;
}

export interface CompanyProfile {
  companyName: string;
  industry: string;
  size?: string;
  region?: string;
}

// Explicitly export all functions as named exports
export async function getFrameworkRecommendations(
  companyProfile: Record<string, unknown>,
  materialityTopics: Record<string, unknown>[] = [],
): Promise<AIAssistantResponse> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-esg-ai-assistant",
      {
        body: {
          prompt:
            "Provide ESG framework recommendations based on the company profile and materiality topics. Include specific indicators from GRI, SASB, TCFD, and UN SDGs that are most relevant.",
          context: {
            companyProfile,
            materialityTopics,
          },
          task: "framework-mapping",
          maxTokens: 800,
        },
      },
    );

    if (error) throw error;
    return { ...data, success: true };
  } catch (error) {
    logger.error("Error getting framework recommendations:", error);
    let errorMessage = "Unable to generate framework recommendations at this time.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      content: "Unable to generate framework recommendations at this time.",
      task: "framework-mapping",
      error: errorMessage,
      success: false,
    };
  }
}

export async function getResourceRecommendations(
  esgPlan: Record<string, unknown> | null,
  companyProfile: Record<string, unknown>,
  materialityTopics: Record<string, unknown>[] = [],
): Promise<AIAssistantResponse> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-esg-ai-assistant",
      {
        body: {
          prompt:
            "Recommend resources from the library that would help implement this ESG plan effectively, with special focus on the high-priority materiality topics.",
          context: {
            esgPlan,
            companyProfile,
            materialityTopics,
          },
          task: "resource-recommendation",
          maxTokens: 600,
        },
      },
    );

    if (error) throw error;
    return { ...data, success: true };
  } catch (error) {
    logger.error("Error getting resource recommendations:", error);
    let errorMessage = "Unable to generate resource recommendations at this time.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      content: "Unable to generate resource recommendations at this time.",
      task: "resource-recommendation",
      error: errorMessage,
      success: false,
    };
  }
}

export async function getMaterialityBasedResources(
  materialityTopics: Record<string, unknown>[],
): Promise<AIAssistantResponse> {
  try {
    // Filter to high-priority topics (high stakeholder and business impact)
    const highPriorityTopics = materialityTopics.filter(
      (topic) => (topic.stakeholderImpact as number) > 0.6 && (topic.businessImpact as number) > 0.6,
    );

    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-esg-ai-assistant",
      {
        body: {
          prompt:
            "Based on the user's high-priority materiality topics, recommend specific resources from the library that would be most relevant. Include specific resource types (guides, templates, frameworks) that would be helpful for each topic.",
          context: {
            materialityTopics: highPriorityTopics,
          },
          task: "materiality-resource-recommendation",
          maxTokens: 800,
        },
      },
    );

    if (error) throw error;
    return { ...data, success: true };
  } catch (error) {
    logger.error(
      "Error getting materiality-based resource recommendations:",
      error,
    );
    let errorMessage = "Unable to generate resource recommendations based on materiality at this time.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      content:
        "Unable to generate resource recommendations based on materiality at this time.",
      task: "materiality-resource-recommendation",
      error: errorMessage,
      success: false,
    };
  }
}

export async function analyzeMaterialityTopics(
  industry: string,
  companySize: string,
  region: string = "Global",
): Promise<AIAssistantResponse> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-esg-ai-assistant",
      {
        body: {
          prompt: `Analyze and recommend material ESG topics for a ${companySize} company in the ${industry} industry operating in ${region}. For each topic, provide a stakeholder impact score (0-1) and business impact score (0-1) with brief justification.`,
          task: "materiality-analysis",
          maxTokens: 1000,
        },
      },
    );

    if (error) throw error;
    return { ...data, success: true };
  } catch (error) {
    logger.error("Error analyzing materiality topics:", error);
    let errorMessage = "Unable to analyze materiality topics at this time.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      content: "Unable to analyze materiality topics at this time.",
      task: "materiality-analysis",
      error: errorMessage,
      success: false,
    };
  }
}

export async function getPeerBenchmarking(
  industry: string,
  companySize: string,
  esgMetrics: Record<string, unknown>,
): Promise<AIAssistantResponse> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-esg-ai-assistant",
      {
        body: {
          prompt:
            "Compare the company's ESG metrics with industry peers and provide benchmarking insights.",
          context: {
            industry,
            companySize,
            esgMetrics,
          },
          task: "peer-benchmarking",
          maxTokens: 800,
        },
      },
    );

    if (error) throw error;
    return { ...data, success: true };
  } catch (error) {
    logger.error("Error getting peer benchmarking:", error);
    let errorMessage = "Unable to generate peer benchmarking at this time.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      content: "Unable to generate peer benchmarking at this time.",
      task: "peer-benchmarking",
      error: errorMessage,
      success: false,
    };
  }
}

export const getESGDataInsights = async (
  userId: string,
  resourceId?: string,
  metricId?: string,
  timeframe: string = "month",
): Promise<{ data: Record<string, unknown> | null; success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-esg-data-insights",
      {
        body: {
          userId,
          resourceId,
          metricId,
          timeframe,
        },
      },
    );

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    logger.error("Error getting ESG data insights:", error);
    let errorMessage = "Failed to get ESG data insights."; // Default message
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { data: null, error: errorMessage, success: false };
  }
};

export const analyzeMaterialityImpactForPlan = async (
  materialityTopics: Record<string, unknown>[],
): Promise<AIAssistantResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-esg-ai-assistant",
      {
        body: {
          prompt:
            "Analyze the provided materiality topics and provide an impact analysis relevant for ESG action plan generation. Focus on interdependencies, potential leverage points, and key risks. The analysis should be concise and directly usable for strategic planning. Return the analysis as a JSON string within the 'content' field.",
          context: {
            materialityTopics,
          },
          task: "materiality-impact-analysis-for-plan",
          maxTokens: 800,
        },
      },
    );

    if (error) throw error;
    return { ...data, success: true };
  } catch (error) {
    logger.error("Error analyzing materiality impact for plan:", error);
    let errorMessage = "Unable to analyze materiality impact at this time.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      content: JSON.stringify({
        error: "Unable to analyze materiality impact at this time.",
      }),
      task: "materiality-impact-analysis-for-plan",
      error: errorMessage,
      success: false,
    };
  }
};

export const generateESGActionPlan = async (
  materialityTopics: Record<string, unknown>[],
  impactAnalysisContent: string,
): Promise<AIAssistantResponse> => {
  let parsedImpactAnalysis = {};
  try {
    parsedImpactAnalysis = JSON.parse(impactAnalysisContent);
  } catch (e) {
    logger.warn(
      "Impact analysis content was not valid JSON, passing as string:",
      impactAnalysisContent,
    );
    parsedImpactAnalysis = { analysisText: impactAnalysisContent };
  }

  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-esg-ai-assistant",
      {
        body: {
          prompt:
            "Based on the materiality topics and their impact analysis, generate a comprehensive ESG action plan. The plan should include a title, description, specific recommendations (each with a description, priority, effort, and impact score), and implementation phases (each with a name, description, and a list of actionable tasks, where each task has a name and status). Return this entire plan as a single well-formed JSON object string within the 'content' field.",
          context: {
            materialityTopics,
            impactAnalysis: parsedImpactAnalysis,
          },
          task: "esg-action-plan-generation",
          maxTokens: 2000,
        },
      },
    );

    if (error) throw error;
    return { ...data, success: true };
  } catch (error) {
    logger.error("Error generating ESG action plan:", error);
    let errorMessage = "Unable to generate ESG action plan at this time.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      content: JSON.stringify({
        error: "Unable to generate ESG action plan at this time.",
      }),
      task: "esg-action-plan-generation",
      error: errorMessage,
      success: false,
    };
  }
};
