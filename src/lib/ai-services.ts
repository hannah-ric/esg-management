import { supabase } from "./supabase";

export interface AIAssistantResponse {
  content: string;
  task: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  error?: string;
}

export async function getFrameworkRecommendations(
  companyProfile: any,
  materialityTopics: any[] = [],
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
    return data;
  } catch (error) {
    console.error("Error getting framework recommendations:", error);
    return {
      content: "Unable to generate framework recommendations at this time.",
      task: "framework-mapping",
      error: error.message,
    };
  }
}

export async function getResourceRecommendations(
  esgPlan: any,
  companyProfile: any,
  materialityTopics: any[] = [],
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
    return data;
  } catch (error) {
    console.error("Error getting resource recommendations:", error);
    return {
      content: "Unable to generate resource recommendations at this time.",
      task: "resource-recommendation",
      error: error.message,
    };
  }
}

export async function getMaterialityBasedResources(
  materialityTopics: any[],
): Promise<AIAssistantResponse> {
  try {
    // Filter to high-priority topics (high stakeholder and business impact)
    const highPriorityTopics = materialityTopics.filter(
      (topic) => topic.stakeholderImpact > 0.6 && topic.businessImpact > 0.6,
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
    return data;
  } catch (error) {
    console.error(
      "Error getting materiality-based resource recommendations:",
      error,
    );
    return {
      content:
        "Unable to generate resource recommendations based on materiality at this time.",
      task: "materiality-resource-recommendation",
      error: error.message,
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
    return data;
  } catch (error) {
    console.error("Error analyzing materiality topics:", error);
    return {
      content: "Unable to analyze materiality topics at this time.",
      task: "materiality-analysis",
      error: error.message,
    };
  }
}

export async function getPeerBenchmarking(
  industry: string,
  companySize: string,
  esgMetrics: any,
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
    return data;
  } catch (error) {
    console.error("Error getting peer benchmarking:", error);
    return {
      content: "Unable to generate peer benchmarking at this time.",
      task: "peer-benchmarking",
      error: error.message,
    };
  }
}

export async function getESGDataInsights(
  userId: string,
  resourceId?: string,
  metricId?: string,
  timeframe: string = "month",
): Promise<any> {
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
    return data;
  } catch (error) {
    console.error("Error getting ESG data insights:", error);
    throw error;
  }
}
