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
  materialityTopics: any[],
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
): Promise<AIAssistantResponse> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-esg-ai-assistant",
      {
        body: {
          prompt:
            "Recommend resources from the library that would help implement this ESG plan effectively.",
          context: {
            esgPlan,
            companyProfile,
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

export async function analyzeMaterialityTopics(
  industry: string,
  companySize: string,
  region: string,
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
