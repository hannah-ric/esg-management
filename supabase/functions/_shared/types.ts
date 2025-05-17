export interface ClerkUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
  publicMetadata?: Record<string, unknown>;
}

export interface OrganizationMembership {
  id: string;
  role: string;
  roleName: string;
  permissions: string[];
  organization: {
    id: string;
    name: string;
    slug: string;
    membersCount: number;
  };
  updatedAt: string;
}

// Define sub-types for ESGPlan
export interface PlanImplementationStep {
  phase: string;
  tasks: string[]; // Or Task[] if Task is defined
  timeline: string;
}

export interface PlanFrameworkRecommendation {
  framework: string;
  indicators: string[];
  description: string;
}

export interface PlanResourceRecommendation {
  topic: string;
  resources: string[]; // Or Resource[] if Resource is defined
}

export interface ESGPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  implementationSteps: PlanImplementationStep[]; // Typed
  frameworkRecommendations: PlanFrameworkRecommendation[]; // Typed
  resourceRecommendations: PlanResourceRecommendation[]; // Typed
  createdAt: string;
  updatedAt: string;
}

export interface MaterialityTopic {
  id: string;
  userId: string;
  topic: string;
  category: string;
  stakeholderImpact: number;
  businessImpact: number;
  justification: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  employeeCount: number;
  annualRevenue: string;
  companyType: string;
  primaryRegion: string;
  currentReporting: string[];
  applicableRegulations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AnalyzeUrlRequest {
  url: string;
  mode?: string;
  extractText?: boolean;
}

export interface DiffbotAnalyzeResponse {
  objects?: Array<{
    title?: string;
    text?: string;
    html?: string;
    date?: string;
    tags?: string[];
  }>;
}

export interface ESGResource {
  title: string;
  url: string;
  type: string;
  category: string;
  description: string;
  date: string;
  source: string;
  tags: string[];
  fileType: string;
  rawContent?: string;
  html?: string;
}
