import { supabase } from "./supabase";

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
}

export interface ESGFrameworkMapping {
  id?: string;
  resource_id: string;
  framework_id: string;
  disclosure_id: string;
  created_at?: string;
  updated_at?: string;
}

// Get ESG data points for a specific resource
export async function getESGDataPoints(
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
    console.error("Error fetching ESG data points:", error);
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
      const dataPoints = await getESGDataPoints(resource.id);
      if (dataPoints.length > 0) {
        result[resource.title] = dataPoints;
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching user ESG data points:", error);
    return {};
  }
}

// Search for ESG data points by metric or value
export async function searchESGDataPoints(
  searchTerm: string,
): Promise<ESGDataPoint[]> {
  try {
    const { data, error } = await supabase
      .from("esg_data_points")
      .select("*")
      .or(`metric_id.ilike.%${searchTerm}%,value.ilike.%${searchTerm}%`);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error searching ESG data points:", error);
    return [];
  }
}

// Get all framework mappings for a specific framework
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
