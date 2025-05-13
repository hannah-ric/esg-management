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

  const { data, error } = await query;

  if (error) throw error;
  return data;
};
