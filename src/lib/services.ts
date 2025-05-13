import { supabase } from "./supabase";

// User services
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

// Company profile services
export const saveCompanyProfile = async (profileData: any) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("company_profiles")
    .insert({
      user_id: user.id,
      ...profileData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Questionnaire data services
export const saveQuestionnaireData = async (questionnaireData: any) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // First check if there's existing data to update
  const { data: existingData } = await supabase
    .from("questionnaire_data")
    .select("*")
    .eq("user_id", user.id)
    .single();

  let result;

  if (existingData) {
    // Update existing record
    const { data, error } = await supabase
      .from("questionnaire_data")
      .update({
        data: questionnaireData.data,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    result = data;
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from("questionnaire_data")
      .insert({
        user_id: user.id,
        data: questionnaireData.data,
      })
      .select()
      .single();

    if (error) throw error;
    result = data;
  }

  return result;
};

export const getQuestionnaireData = async (userId: string) => {
  const { data, error } = await supabase
    .from("questionnaire_data")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 is the error code for no rows returned
  return data?.data || {};
};

export const getCompanyProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("company_profiles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 is the error code for no rows returned
  return data;
};

// Materiality topics services
export const saveMaterialityTopics = async (topics: any[]) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // First delete existing topics for this user
  await supabase.from("materiality_topics").delete().eq("user_id", user.id);

  // Then insert the new topics
  const { data, error } = await supabase
    .from("materiality_topics")
    .insert(
      topics.map((topic) => ({
        user_id: user.id,
        name: topic.name,
        category: topic.category,
        stakeholder_impact: topic.stakeholderImpact,
        business_impact: topic.businessImpact,
        description: topic.description,
      })),
    )
    .select();

  if (error) throw error;
  return data;
};

export const getMaterialityTopics = async (userId: string) => {
  const { data, error } = await supabase
    .from("materiality_topics")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data.map((topic) => ({
    id: topic.id,
    name: topic.name,
    category: topic.category,
    stakeholderImpact: topic.stakeholder_impact,
    businessImpact: topic.business_impact,
    description: topic.description,
  }));
};

// ESG Plan services
export const saveESGPlan = async (planData: any) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Get the latest company profile
  const companyProfile = await getCompanyProfile(user.id);
  if (!companyProfile) throw new Error("No company profile found");

  const { data, error } = await supabase
    .from("esg_plans")
    .insert({
      user_id: user.id,
      company_profile_id: companyProfile.id,
      title: planData.title,
      description: planData.description,
      frameworks: planData.frameworks,
      implementation_phases: planData.implementationPhases,
      resource_requirements: planData.resourceRequirements,
      custom_metrics: planData.customMetrics,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getESGPlan = async (userId: string) => {
  const { data, error } = await supabase
    .from("esg_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};

// Implementation phases services
export const saveImplementationPhases = async (
  userId: string,
  phases: any[],
) => {
  // First check if there's existing data to update
  const { data: existingData } = await supabase
    .from("implementation_phases")
    .select("*")
    .eq("user_id", userId)
    .single();

  let result;

  if (existingData) {
    // Update existing record
    const { data, error } = await supabase
      .from("implementation_phases")
      .update({
        phases: phases,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    result = data;
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from("implementation_phases")
      .insert({
        user_id: userId,
        phases: phases,
      })
      .select()
      .single();

    if (error) throw error;
    result = data;
  }

  return result;
};

export const getImplementationPhases = async (userId: string) => {
  const { data, error } = await supabase
    .from("implementation_phases")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data?.phases || [];
};

// Resource library services
export const getResources = async (filters: any = {}) => {
  let query = supabase.from("resources").select("*");

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
    );
  }

  if (filters.topics && filters.topics.length > 0) {
    // Filter by topics that might be in the title, description, or tags
    const topicConditions = filters.topics
      .map(
        (topic: string) =>
          `title.ilike.%${topic}%,description.ilike.%${topic}%`,
      )
      .join(",");
    query = query.or(topicConditions);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const uploadResource = async (resourceData: any) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("resources")
    .insert({
      title: resourceData.title,
      description: resourceData.description,
      type: resourceData.type,
      category: resourceData.category,
      url: resourceData.url,
      file_type: resourceData.fileType,
      file_path: resourceData.filePath,
      source: resourceData.source || "User Upload",
      date_added: new Date().toISOString(),
      tags: resourceData.tags,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Custom metrics services
export const getCustomMetrics = async (userId: string) => {
  const { data, error } = await supabase
    .from("custom_metrics")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data || [];
};

export const saveCustomMetric = async (userId: string, metricData: any) => {
  const { data, error } = await supabase
    .from("custom_metrics")
    .insert({
      user_id: userId,
      name: metricData.name,
      target: metricData.target,
      current: metricData.current,
      unit: metricData.unit,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCustomMetric = async (metricId: string, metricData: any) => {
  const { data, error } = await supabase
    .from("custom_metrics")
    .update({
      name: metricData.name,
      target: metricData.target,
      current: metricData.current,
      unit: metricData.unit,
      updated_at: new Date().toISOString(),
    })
    .eq("id", metricId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCustomMetric = async (userId: string, metricId: string) => {
  const { error } = await supabase
    .from("custom_metrics")
    .delete()
    .eq("id", metricId)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
};
