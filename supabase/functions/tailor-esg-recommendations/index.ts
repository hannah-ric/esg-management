import { corsHeaders } from "@shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { handleError, handleValidationError } from "@shared/error-handler.ts";
import { validateRequiredFields } from "@shared/validation.ts";
import { cache } from "@shared/cache.ts";

interface TailoredRecommendationsRequest {
  userId: string;
  industry?: string;
  companySize?: string;
  materialityTopics?: string[];
  region?: string;
  maxRecommendations?: number;
  page?: number;
  pageSize?: number;
}

interface ResourceResponse {
  id: string;
  name: string;
  description: string;
  type: string;
  url: string;
  tags: string[];
  industry_relevance: string | string[];
  company_size_relevance: string | string[];
  region_relevance: string | string[];
  topic_relevance: string | string[];
  created_at: string;
  relevanceScore?: number;
}

interface PaginatedResponse {
  recommendations: ResourceResponse[];
  explanation: string;
  filters: {
    industry?: string;
    companySize?: string;
    region: string;
    materialityTopics: string[];
  };
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const requestData = (await req.json()) as TailoredRecommendationsRequest;

    // Validate required fields
    const validationError = validateRequiredFields(requestData, ["userId"]);
    if (validationError) {
      return handleValidationError(validationError);
    }

    const {
      userId,
      industry,
      companySize,
      materialityTopics = [],
      region = "Global",
      maxRecommendations = 10,
      page = 1,
      pageSize = 10,
    } = requestData;

    // Check cache for identical requests
    const cacheKey = `recommendations:${userId}:${industry || ""}:${companySize || ""}:${materialityTopics.join(",")}:${region}:${page}:${pageSize}`;
    const cachedResponse = cache.get<PaginatedResponse>(cacheKey);

    if (cachedResponse) {
      return new Response(JSON.stringify(cachedResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user's company profile if industry and companySize not provided
    let userIndustry = industry;
    let userCompanySize = companySize;

    if (!userIndustry || !userCompanySize) {
      const { data: profileData, error: profileError } = await supabase
        .from("company_profiles")
        .select("industry, employee_count")
        .eq("user_id", userId)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        console.error("Error fetching company profile:", profileError);
      }

      if (profileData) {
        userIndustry = userIndustry || profileData.industry;
        userCompanySize =
          userCompanySize || mapEmployeeCountToSize(profileData.employee_count);
      }
    }

    // Fetch user's materiality topics if not provided
    let userMaterialityTopics = materialityTopics;

    if (userMaterialityTopics.length === 0) {
      const { data: topicsData, error: topicsError } = await supabase
        .from("materiality_topics")
        .select("topic")
        .eq("user_id", userId)
        .order("stakeholder_impact", { ascending: false })
        .order("business_impact", { ascending: false })
        .limit(5);

      if (topicsError) {
        console.error("Error fetching materiality topics:", topicsError);
      }

      if (topicsData && topicsData.length > 0) {
        userMaterialityTopics = topicsData.map((t) => t.topic);
      }
    }

    // Fetch resources from the database
    let query = supabase
      .from("resources")
      .select(
        `
        id,
        name,
        description,
        type,
        url,
        tags,
        industry_relevance,
        company_size_relevance,
        region_relevance,
        topic_relevance,
        created_at
      `,
      )
      .order("created_at", { ascending: false });

    const { data: resources, error: resourcesError } = await query;

    if (resourcesError) {
      throw resourcesError;
    }

    // Score and rank resources based on relevance
    const scoredResources = resources.map((resource) => {
      let score = 0;

      // Score based on industry relevance
      if (userIndustry && resource.industry_relevance) {
        const industries = Array.isArray(resource.industry_relevance)
          ? resource.industry_relevance
          : [resource.industry_relevance];

        if (
          industries.includes(userIndustry) ||
          industries.includes("All Industries")
        ) {
          score += 30;
        }
      }

      // Score based on company size relevance
      if (userCompanySize && resource.company_size_relevance) {
        const sizes = Array.isArray(resource.company_size_relevance)
          ? resource.company_size_relevance
          : [resource.company_size_relevance];

        if (sizes.includes(userCompanySize) || sizes.includes("All Sizes")) {
          score += 20;
        }
      }

      // Score based on region relevance
      if (region && resource.region_relevance) {
        const regions = Array.isArray(resource.region_relevance)
          ? resource.region_relevance
          : [resource.region_relevance];

        if (regions.includes(region) || regions.includes("Global")) {
          score += 15;
        }
      }

      // Score based on topic relevance
      if (userMaterialityTopics.length > 0 && resource.topic_relevance) {
        const topics = Array.isArray(resource.topic_relevance)
          ? resource.topic_relevance
          : [resource.topic_relevance];

        const matchingTopics = userMaterialityTopics.filter((topic) =>
          topics.some((t) => t.toLowerCase().includes(topic.toLowerCase())),
        );

        score += matchingTopics.length * 10;
      }

      // Score based on tags
      if (userMaterialityTopics.length > 0 && resource.tags) {
        const tags = Array.isArray(resource.tags)
          ? resource.tags
          : [resource.tags];

        const matchingTags = userMaterialityTopics.filter((topic) =>
          tags.some((tag) => tag.toLowerCase().includes(topic.toLowerCase())),
        );

        score += matchingTags.length * 5;
      }

      return {
        ...resource,
        relevanceScore: score,
      };
    });

    // Sort by relevance score
    const sortedResources = scoredResources.sort(
      (a, b) => b.relevanceScore! - a.relevanceScore!,
    );

    // Calculate pagination
    const totalItems = sortedResources.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const currentPage = Math.min(Math.max(1, page), totalPages || 1);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    // Get paginated recommendations
    const paginatedRecommendations = sortedResources.slice(
      startIndex,
      endIndex,
    );

    // Generate explanation for recommendations
    const explanation = generateExplanation(
      paginatedRecommendations,
      userIndustry,
      userCompanySize,
      region,
      userMaterialityTopics,
    );

    // Prepare response
    const response: PaginatedResponse = {
      recommendations: paginatedRecommendations,
      explanation,
      filters: {
        industry: userIndustry,
        companySize: userCompanySize,
        region,
        materialityTopics: userMaterialityTopics,
      },
      pagination: {
        page: currentPage,
        pageSize,
        totalItems,
        totalPages,
      },
    };

    // Cache the response for 5 minutes
    cache.set(cacheKey, response, 300);

    // Log for monitoring
    console.log(
      `Generated recommendations for user ${userId} - Found ${totalItems} resources, showing page ${currentPage}/${totalPages}`,
    );

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating tailored recommendations:", error);
    return handleError(error);
  }
});

// Helper function to map employee count to company size category
function mapEmployeeCountToSize(employeeCount: number): string {
  if (!employeeCount) return "Medium";

  if (employeeCount < 50) return "Small";
  if (employeeCount < 250) return "Medium";
  if (employeeCount < 1000) return "Large";
  return "Enterprise";
}

// Helper function to generate explanation for recommendations
function generateExplanation(
  recommendations: ResourceResponse[],
  industry?: string,
  companySize?: string,
  region?: string,
  materialityTopics: string[] = [],
): string {
  if (recommendations.length === 0) {
    return "No recommendations could be generated based on your profile. Please provide more information about your company and ESG priorities.";
  }

  let explanation = `These recommendations are tailored for `;

  if (industry) {
    explanation += `${industry} industry companies `;

    if (companySize) {
      explanation += `of ${companySize.toLowerCase()} size `;
    }
  } else if (companySize) {
    explanation += `${companySize} sized companies `;
  } else {
    explanation += `your company profile `;
  }

  if (region && region !== "Global") {
    explanation += `operating in the ${region} region `;
  }

  if (materialityTopics.length > 0) {
    explanation += `with a focus on key materiality topics including ${materialityTopics.slice(0, 3).join(", ")}${materialityTopics.length > 3 ? ", and others" : ""}. `;
  } else {
    explanation += ". ";
  }

  // Add information about the types of resources recommended
  const resourceTypes = [...new Set(recommendations.map((r) => r.type))];

  if (resourceTypes.length > 0) {
    explanation += `The recommendations include ${resourceTypes.join(", ")} that can help you advance your ESG initiatives.`;
  }

  return explanation;
}
