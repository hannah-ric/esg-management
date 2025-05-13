import { supabase } from "./supabase";

export interface TailoredRecommendationsRequest {
  url?: string;
  surveyAnswers: Record<string, any>;
  materialityTopics?: any[];
}

export interface TailoredRecommendationsResponse {
  recommendations: {
    content: string;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  };
  diffbotData: any;
  success: boolean;
  error?: string;
}

export interface ParsedRecommendations {
  materialityTopics: MaterialityTopic[];
  frameworks: FrameworkRecommendation[];
  implementationSteps: ImplementationStep[];
  resourceRecommendations: ResourceRecommendation[];
}

export interface MaterialityTopic {
  id: string;
  name: string;
  category: "environmental" | "social" | "governance";
  stakeholderImpact: number;
  businessImpact: number;
  description: string;
}

export interface FrameworkRecommendation {
  framework: string;
  indicators: string[];
  description: string;
}

export interface ImplementationStep {
  phase: string;
  tasks: string[];
  timeline: string;
}

export interface ResourceRecommendation {
  topic: string;
  resources: string[];
}

/**
 * Get tailored ESG recommendations based on survey answers, external content, and materiality topics
 */
export async function getTailoredRecommendations(
  request: TailoredRecommendationsRequest,
): Promise<TailoredRecommendationsResponse> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-tailor-esg-recommendations",
      {
        body: request,
      },
    );

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Error getting tailored recommendations:", error);
    return {
      recommendations: {
        content: "Unable to generate tailored recommendations at this time.",
        usage: { input_tokens: 0, output_tokens: 0 },
      },
      diffbotData: null,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Parse the AI-generated recommendations into a structured format
 */
export function parseRecommendations(content: string): ParsedRecommendations {
  // This is a simplified parser - in a real implementation, you would want to use
  // more robust parsing logic or have the AI return structured JSON directly

  // Default return structure
  const result: ParsedRecommendations = {
    materialityTopics: [],
    frameworks: [],
    implementationSteps: [],
    resourceRecommendations: [],
  };

  try {
    // Parse materiality topics
    const topicMatches = content.match(
      /([\w\s&]+)\s*-\s*Stakeholder Impact:\s*([0-9.]+)\s*,\s*Business Impact:\s*([0-9.]+)/g,
    );

    if (topicMatches) {
      result.materialityTopics = topicMatches.map((match, index) => {
        const nameMatch = match.match(/([\w\s&]+)\s*-/);
        const stakeholderMatch = match.match(/Stakeholder Impact:\s*([0-9.]+)/);
        const businessMatch = match.match(/Business Impact:\s*([0-9.]+)/);
        const descriptionMatch = match.match(/- (.+)$/);

        const name = nameMatch ? nameMatch[1].trim() : `Topic ${index + 1}`;
        const stakeholderImpact = stakeholderMatch
          ? parseFloat(stakeholderMatch[1])
          : 0.5;
        const businessImpact = businessMatch
          ? parseFloat(businessMatch[1])
          : 0.5;
        const description = descriptionMatch ? descriptionMatch[1].trim() : "";

        // Determine category based on topic name
        let category: "environmental" | "social" | "governance" =
          "environmental";
        if (
          /diversity|employee|human|community|social|health|safety/i.test(name)
        ) {
          category = "social";
        } else if (/governance|board|ethics|compliance|risk/i.test(name)) {
          category = "governance";
        }

        return {
          id: `ai-${index}`,
          name,
          category,
          stakeholderImpact,
          businessImpact,
          description:
            description ||
            `${name} is an important ESG topic for your industry.`,
        };
      });
    }

    // Parse framework recommendations
    const frameworkSections = content.split(
      /\n\d+\. Recommended ESG frameworks/i,
    )[1];
    if (frameworkSections) {
      const frameworkMatches = frameworkSections.match(
        /([A-Z]+)\s*:\s*([^\n]+)/g,
      );
      if (frameworkMatches) {
        result.frameworks = frameworkMatches.map((match, index) => {
          const parts = match.split(":");
          const framework = parts[0].trim();
          const description = parts.slice(1).join(":").trim();

          // Extract indicators if present
          const indicators = description.match(/\b[A-Z0-9]+-?\d*\b/g) || [];

          return {
            framework,
            indicators,
            description,
          };
        });
      }
    }

    // Parse implementation steps
    const implementationSection = content.split(
      /\n\d+\. Suggested implementation steps/i,
    )[1];
    if (implementationSection) {
      const phaseMatches = implementationSection.match(
        /Phase \d+[^:]*:[^\n]+/g,
      );
      if (phaseMatches) {
        result.implementationSteps = phaseMatches.map((match) => {
          const parts = match.split(":");
          const phase = parts[0].trim();
          const description = parts.slice(1).join(":").trim();

          // Extract tasks
          const tasks = description.split(",").map((task) => task.trim());

          return {
            phase,
            tasks,
            timeline: phase.includes("(")
              ? phase.match(/\(([^)]+)\)/)?.[1] || ""
              : "",
          };
        });
      }
    }

    // Parse resource recommendations
    const resourceSection = content.split(
      /\n\d+\. Resource recommendations/i,
    )[1];
    if (resourceSection) {
      const topicMatches = resourceSection.match(/([\w\s&]+):[^\n]+/g);
      if (topicMatches) {
        result.resourceRecommendations = topicMatches.map((match) => {
          const parts = match.split(":");
          const topic = parts[0].trim();
          const resourcesText = parts.slice(1).join(":").trim();

          // Extract resources
          const resources = resourcesText
            .split(",")
            .map((resource) => resource.trim());

          return {
            topic,
            resources,
          };
        });
      }
    }

    return result;
  } catch (error) {
    console.error("Error parsing recommendations:", error);
    return result;
  }
}
