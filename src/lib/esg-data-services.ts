import { supabase } from "./supabase";

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
  context?: string;
  confidence: number;
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
  updated_at?: string;
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

// Get ESG data points for a specific resource with pagination
export async function getESGDataPoints(
  resourceId: string,
  pagination?: PaginationParams
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
      totalPages
    };
  } catch (error) {
    console.error("Error fetching ESG data points:", error);
    return {
      data: [],
      count: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0
    };
  }
}

// Get all ESG data points (unpaginated - only for compatibility with existing code)
export async function getAllESGDataPoints(
  resourceId: string
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
      const dataPoints = await getESGDataPoints(resource.id, { page: 1, pageSize: 5 });
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
  pagination?: PaginationParams
): Promise<PaginatedResponse<ESGDataPoint>> {
  try {
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 20;
    const startIndex = (page - 1) * pageSize;

    // Prepare the search query for Supabase full-text search
    // websearch_to_tsquery is often more user-friendly than to_tsquery
    // It handles multiple words, OR operators, quoted phrases etc.
    const ftsQuery = searchTerm.trim().split(/\s+/).join(' & '); // Basic conversion to 'word1 & word2' for AND logic
                                                              // For more complex parsing use websearch_to_tsquery or plainto_tsquery
                                                              // directly in a .rpc() call if needed, or ensure searchTerm is formatted correctly.

    // Query for the total count of matching records using FTS
    const { count, error: countError } = await supabase
      .from("esg_data_points")
      .select("*", { count: "exact", head: true })
      .textSearch('fts', ftsQuery, { type: 'websearch' }); // Use 'websearch' type if ftsQuery is structured for it, or 'plain' for plainto_tsquery logic

    if (countError) {
        // Fallback to ILIKE if FTS fails (e.g. column not ready, or temporary issue)
        // This is a temporary measure; ideally, FTS should be reliable.
        console.warn("FTS count query failed, falling back to ILIKE search for count:", countError);
        const { count: ilikeCount, error: ilikeCountError } = await supabase
            .from("esg_data_points")
            .select("*", { count: "exact", head: true })
            .or([ // Ensure this OR query matches the ILIKE data query fallback
                `metric_id.ilike.%${searchTerm}%`,
                `value.ilike.%${searchTerm}%`,
                `context.ilike.%${searchTerm}%`,
                `source.ilike.%${searchTerm}%`
            ].join(","));
        if (ilikeCountError) throw ilikeCountError;
        if (ilikeCount === null) throw new Error("Failed to retrieve count with ILIKE fallback.");
        return searchESGDataPointsWithIlikeFallback(searchTerm, pagination, ilikeCount); // Call a fallback using ILIKE for data as well
    }

    // Query for the paginated data using FTS
    const { data, error } = await supabase
      .from("esg_data_points")
      .select("*")
      .textSearch('fts', ftsQuery, { type: 'websearch' })
      .range(startIndex, startIndex + pageSize - 1);

    if (error) {
        console.warn("FTS data query failed, falling back to ILIKE search for data:", error);
        if (count === null) throw new Error("Count is null, cannot proceed with ILIKE fallback accurately for data pagination.");
        return searchESGDataPointsWithIlikeFallback(searchTerm, pagination, count); // Call a fallback using ILIKE
    }
    
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
    console.error("Error searching ESG data points (FTS with fallback):", error);
    // Final fallback if everything else fails, or rethrow
    return searchESGDataPointsWithIlikeFallback(searchTerm, pagination); 
  }
}

// Fallback function using ILIKE (original paginated search)
async function searchESGDataPointsWithIlikeFallback(
    searchTerm: string,
    pagination?: PaginationParams,
    precomputedCount?: number | null
): Promise<PaginatedResponse<ESGDataPoint>> {
    console.log("Executing ILIKE fallback search for:", searchTerm);
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    let totalCount = 0;

    if (precomputedCount !== undefined && precomputedCount !== null) {
        totalCount = precomputedCount;
    } else {
        const { count, error: countError } = await supabase
            .from("esg_data_points")
            .select("*", { count: "exact", head: true })
            .or([
                `metric_id.ilike.%${searchTerm}%`,
                `value.ilike.%${searchTerm}%`,
                `context.ilike.%${searchTerm}%`,
                `source.ilike.%${searchTerm}%`
            ].join(","));
        if (countError) throw countError;
        totalCount = count || 0;
    }

    const { data, error } = await supabase
        .from("esg_data_points")
        .select("*")
        .or([
            `metric_id.ilike.%${searchTerm}%`,
            `value.ilike.%${searchTerm}%`,
            `context.ilike.%${searchTerm}%`,
            `source.ilike.%${searchTerm}%`
        ].join(","))
        .range(startIndex, startIndex + pageSize - 1);

    if (error) throw error;

    const totalPages = Math.ceil(totalCount / pageSize);
    return {
        data: data || [],
        count: totalCount,
        page,
        pageSize,
        totalPages,
    };
}

// Get framework recommendations based on metric data
export async function getFrameworkRecommendations(metricData: {
  metricId: string;
  value: string;
  context?: string;
}): Promise<any[]> {
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
