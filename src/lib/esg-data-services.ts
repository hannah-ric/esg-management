import { supabase } from "./supabase";
import { measureAsync } from "./performance-utils";

export interface ESGHistoricalDataPoint {
  year: string;
  value: string;
  source: string;
}

export interface ESGDataPoint {
  id?: string;
  resource_id: string;
  metric_id: string;
  value: string;
  context?: string | null;
  confidence: number | null;
  source: string;
  framework_id?: string;
  disclosure_id?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  is_edited?: boolean;
  reporting_year?: string;
  historical_data?: ESGHistoricalDataPoint[];
}

export interface ESGFrameworkMapping {
  id?: string;
  resource_id: string;
  framework_id: string;
  disclosure_id: string;
  created_at?: string;
  updated_at?: string | null;
}

export interface ESGFramework {
  id: string;
  name: string;
  description: string | null;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Fetch available ESG frameworks from the database
export async function getFrameworks(): Promise<ESGFramework[]> {
  try {
    const { data, error } = await supabase
      .from("frameworks")
      .select("id, name, description");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching frameworks:", error);
    return [];
  }
}

// Get ESG data points for a specific resource with pagination
export async function getESGDataPoints(
  resourceId: string,
  pagination?: PaginationParams,
): Promise<PaginatedResponse<ESGDataPoint>> {
  try {
    // Default pagination values
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 20;
    const startIndex = (page - 1) * pageSize;

    // First get the total count
    const { count, error: countError } = await supabase
      .from("esg_data_points")
      .select("*", { count: "exact", head: true })
      .eq("resource_id", resourceId);

    if (countError) throw countError;

    // Then get the paginated data
    const { data, error } = await supabase
      .from("esg_data_points")
      .select("*")
      .eq("resource_id", resourceId)
      .range(startIndex, startIndex + pageSize - 1);

    if (error) throw error;

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: data || [],
      count: totalCount,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching ESG data points:", error);
    return {
      data: [],
      count: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    };
  }
}

// Get all ESG data points (unpaginated - only for compatibility with existing code)
export async function getAllESGDataPoints(
  resourceId: string,
): Promise<ESGDataPoint[]> {
  try {
    const { data, error } = await supabase
      .from("esg_data_points")
      .select("*")
      .eq("resource_id", resourceId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching all ESG data points:", error);
    return [];
  }
}

// Get framework mappings for a specific resource
export async function getESGFrameworkMappings(
  resourceId: string,
): Promise<ESGFrameworkMapping[]> {
  try {
    const { data, error } = await supabase
      .from("esg_framework_mappings")
      .select("*")
      .eq("resource_id", resourceId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching ESG framework mappings:", error);
    return [];
  }
}

// Save or update an ESG data point
export async function saveESGDataPoint(
  dataPoint: ESGDataPoint,
): Promise<ESGDataPoint | null> {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    // Check if data point already exists
    if (dataPoint.id) {
      // Update existing data point
      const { data, error } = await supabase
        .from("esg_data_points")
        .update({
          value: dataPoint.value,
          context: dataPoint.context,
          confidence: dataPoint.confidence,
          updated_at: new Date().toISOString(),
          user_id: userId,
          is_edited: true,
        })
        .eq("id", dataPoint.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Insert new data point
      const { data, error } = await supabase
        .from("esg_data_points")
        .insert({
          ...dataPoint,
          user_id: userId,
          is_edited: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error("Error saving ESG data point:", error);
    return null;
  }
}

// Delete an ESG data point
export async function deleteESGDataPoint(
  dataPointId: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("esg_data_points")
      .delete()
      .eq("id", dataPointId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting ESG data point:", error);
    return false;
  }
}

// Save a new framework mapping
export async function saveESGFrameworkMapping(
  mapping: ESGFrameworkMapping,
): Promise<ESGFrameworkMapping | null> {
  try {
    // Check if mapping already exists
    const { data: existingMapping } = await supabase
      .from("esg_framework_mappings")
      .select("id")
      .eq("resource_id", mapping.resource_id)
      .eq("framework_id", mapping.framework_id)
      .eq("disclosure_id", mapping.disclosure_id)
      .single();

    if (existingMapping) {
      // Mapping already exists, return it
      return mapping;
    }

    // Insert new mapping
    const { data, error } = await supabase
      .from("esg_framework_mappings")
      .insert(mapping)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error saving ESG framework mapping:", error);
    return null;
  }
}

// Delete a framework mapping
export async function deleteESGFrameworkMapping(
  mappingId: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("esg_framework_mappings")
      .delete()
      .eq("id", mappingId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting ESG framework mapping:", error);
    return false;
  }
}

// Get all ESG data points for a user
export async function getUserESGDataPoints(): Promise<
  Record<string, ESGDataPoint[]>
> {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    // Get all resources for the user
    const { data: resources } = await supabase
      .from("resources")
      .select("id, title")
      .eq("user_id", userId);

    if (!resources || resources.length === 0) return {};

    // Get all data points for these resources
    const result: Record<string, ESGDataPoint[]> = {};
    for (const resource of resources) {
      // Fetch only the first page for preview in dashboard; actual loading is paginated
      const dataPoints = await getESGDataPoints(resource.id, {
        page: 1,
        pageSize: 5,
      });
      if (dataPoints.data.length > 0) {
        result[resource.title] = dataPoints.data;
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching user ESG data points:", error);
    return {};
  }
}

// Search for ESG data points by metric or value with pagination using Full-Text Search
export async function searchESGDataPoints(
  searchTerm: string,
  pagination?: PaginationParams,
  filters?: { metricId?: string; frameworkId?: string },
): Promise<PaginatedResponse<ESGDataPoint & { similarity?: number }>> {
  return measureAsync("searchESGDataPoints", async () => {
    try {
      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 20;
      const { data: embedData, error: embedErr } = await supabase.functions.invoke(
        "supabase-functions-embed-text",
        { body: { text: searchTerm } },
      );
      if (embedErr) throw embedErr;
      const embedding = (embedData as any).embedding as number[];

      const rpcPayload: Record<string, unknown> = {
        embedding,
        match_count: pageSize,
        similarity_threshold: 0.7,
        offset: (page - 1) * pageSize,
      };
      if (filters?.metricId) rpcPayload.metric_id = filters.metricId;
      if (filters?.frameworkId) rpcPayload.framework_id = filters.frameworkId;

      const { data, error, count } = await supabase.rpc(
        "match_esg_data_points",
        rpcPayload,
      );
      if (error) throw error;
      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      return {
        data: data || [],
        count: totalCount,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      console.error("Error searching ESG data points with embeddings:", error);
      return {
        data: [],
        count: 0,
        page: 1,
        pageSize: pagination?.pageSize || 20,
        totalPages: 0,
      };
    }
  });
}

// Define a more specific type for framework recommendations
export interface FrameworkRecItem {
  framework: string;
  disclosure: string;
  description: string;
}

// Get framework recommendations based on metric data
export async function getFrameworkRecommendations(metricData: {
  metricId: string;
  value: string;
  context?: string;
}): Promise<FrameworkRecItem[]> {
  try {
    // This is a simplified version - in a real app, you might call an AI service
    // or have a more sophisticated recommendation engine

    // For now, return some mock recommendations based on the metric ID
    const recommendations = [];

    switch (metricData.metricId) {
      case "carbon-emissions":
        recommendations.push(
          {
            framework: "GRI",
            disclosure: "305-1",
            description: "Direct (Scope 1) GHG emissions",
          },
          {
            framework: "SASB",
            disclosure: "EM-MM-110a.1",
            description: "Gross global Scope 1 emissions",
          },
          {
            framework: "TCFD",
            disclosure: "Metrics & Targets",
            description:
              "Disclose Scope 1, Scope 2, and Scope 3 greenhouse gas emissions",
          },
        );
        break;
      case "energy-consumption":
        recommendations.push(
          {
            framework: "GRI",
            disclosure: "302-1",
            description: "Energy consumption within the organization",
          },
          {
            framework: "SASB",
            disclosure: "IF-EU-000.B",
            description: "Total electricity delivered to customers",
          },
        );
        break;
      case "water-usage":
        recommendations.push(
          {
            framework: "GRI",
            disclosure: "303-3",
            description: "Water withdrawal",
          },
          {
            framework: "SASB",
            disclosure: "FB-AG-140a.1",
            description: "Total water withdrawn",
          },
        );
        break;
      case "waste-management":
        recommendations.push(
          {
            framework: "GRI",
            disclosure: "306-3",
            description: "Waste generated",
          },
          {
            framework: "SASB",
            disclosure: "RR-ST-150a.1",
            description: "Amount of hazardous waste generated",
          },
        );
        break;
      case "diversity-inclusion":
        recommendations.push(
          {
            framework: "GRI",
            disclosure: "405-1",
            description: "Diversity of governance bodies and employees",
          },
          {
            framework: "SASB",
            disclosure: "SV-PS-330a.1",
            description:
              "Percentage of gender and racial/ethnic group representation",
          },
        );
        break;
      default:
        // For other metrics, provide some generic recommendations
        recommendations.push(
          {
            framework: "GRI",
            disclosure: "General",
            description: "Consider relevant GRI topic-specific disclosures",
          },
          {
            framework: "SASB",
            disclosure: "Industry-specific",
            description: "Check SASB standards for your industry",
          },
          {
            framework: "SDG",
            disclosure: "Goals 1-17",
            description: "Align with relevant Sustainable Development Goals",
          },
        );
    }

    return recommendations;
  } catch (error) {
    console.error("Error getting framework recommendations:", error);
    return [];
  }
}

export async function getFrameworkMappings(
  frameworkId: string,
): Promise<ESGFrameworkMapping[]> {
  try {
    const { data, error } = await supabase
      .from("esg_framework_mappings")
      .select("*")
      .eq("framework_id", frameworkId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching framework mappings:", error);
    return [];
  }
}
