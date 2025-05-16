// Export all named exports from all lib modules
export {
  AIAssistantResponse,
  CompanyProfile,
  getFrameworkRecommendations,
  getResourceRecommendations,
  getMaterialityBasedResources,
  analyzeMaterialityTopics,
  getPeerBenchmarking,
  getESGDataInsights,
  analyzeMaterialityImpactForPlan,
  generateESGActionPlan
} from "./ai-services";
export { logger } from "./logger";
export { cn, parseLocaleNumber, formatLocaleNumber } from "./utils";
export { withErrorHandling, useErrorHandler, sanitizeInput, sanitizeObject } from "./error-utils";
export { saveQuestionnaireData, getQuestionnaireData, getMockUser } from "./services";
export {
  ESGHistoricalDataPoint,
  ESGDataPoint,
  ESGFrameworkMapping,
  PaginationParams,
  PaginatedResponse,
  getESGDataPoints,
  getAllESGDataPoints,
  getESGFrameworkMappings,
  saveESGDataPoint,
  deleteESGDataPoint,
  saveESGFrameworkMapping,
  deleteESGFrameworkMapping,
  getUserESGDataPoints,
  searchESGDataPoints,
  getFrameworkRecommendations as getMetricFrameworkRecommendations,
  getFrameworkMappings as getFrameworkMappingsByFrameworkId
} from "./esg-data-services";
export {
  TailoredRecommendationsRequest,
  TailoredRecommendationsResponse,
  ParsedRecommendations,
  MaterialityTopic,
  FrameworkRecommendation,
  ImplementationStep,
  ResourceRecommendation,
  getTailoredRecommendations,
  parseRecommendations
} from "./tailored-recommendations";
export { analyzeExternalContent, searchResourceLibrary, generateAIRecommendations } from "./plan-enhancement";
export { StripeKeyProvider, useStripeKey } from "./stripe-key-provider";

// Import the functions explicitly to include in the default export
import {
  getFrameworkRecommendations,
  getResourceRecommendations,
  getMaterialityBasedResources,
  analyzeMaterialityTopics,
  getPeerBenchmarking,
  getESGDataInsights,
  analyzeMaterialityImpactForPlan,
  generateESGActionPlan,
} from "./ai-services";

// Import other default exports
import loggerExports from "./logger.index";
import utilsExports from "./utils.index";
import errorUtilsExports from "./error-utils.index";
import servicesExports from "./services.index";
import esgDataServicesExports from "./esg-data-services.index";
import tailoredRecommendationsExports from "./tailored-recommendations.index";
import planEnhancementExports from "./plan-enhancement.index";
import * as stripeKeyExports from "./stripe-key-provider.index";

// Imports for constructing the default export
import {
  AIAssistantResponse as AIResponseDefault, 
  CompanyProfile as CompanyProfileDefault,
  getFrameworkRecommendations as getFrameworkRecommendationsFromAI,
  getResourceRecommendations as getResourceRecommendationsFromAI,
  getMaterialityBasedResources as getMaterialityBasedResourcesFromAI,
  analyzeMaterialityTopics as analyzeMaterialityTopicsFromAI,
  getPeerBenchmarking as getPeerBenchmarkingFromAI,
  getESGDataInsights as getESGDataInsightsFromAI,
  analyzeMaterialityImpactForPlan as analyzeMaterialityImpactForPlanFromAI,
  generateESGActionPlan as generateESGActionPlanFromAI,
} from "./ai-services";

import loggerExports from "./logger.index"; 
import utilsExports from "./utils.index";
import errorUtilsExports from "./error-utils.index"; 
import servicesExports from "./services.index"; 
import esgDataServicesExports from "./esg-data-services.index"; 
import tailoredRecommendationsExports from "./tailored-recommendations.index"; 
import planEnhancementExports from "./plan-enhancement.index"; 
import { StripeKeyProvider as StripeKeyProviderDefault, useStripeKey as useStripeKeyDefault } from "./stripe-key-provider";

// Create a default export for modules that need it
const libExports = {
  AIAssistantResponse: AIResponseDefault,
  CompanyProfile: CompanyProfileDefault,
  getFrameworkRecommendations: getFrameworkRecommendationsFromAI,
  getResourceRecommendations: getResourceRecommendationsFromAI,
  getMaterialityBasedResources: getMaterialityBasedResourcesFromAI,
  analyzeMaterialityTopics: analyzeMaterialityTopicsFromAI,
  getPeerBenchmarking: getPeerBenchmarkingFromAI,
  getESGDataInsights: getESGDataInsightsFromAI,
  analyzeMaterialityImpactForPlan: analyzeMaterialityImpactForPlanFromAI,
  generateESGActionPlan: generateESGActionPlanFromAI,

  logger: loggerExports.logger,

  cn: utilsExports.cn,
  parseLocaleNumber: utilsExports.parseLocaleNumber,
  formatLocaleNumber: utilsExports.formatLocaleNumber,

  withErrorHandling: errorUtilsExports.withErrorHandling,
  useErrorHandler: errorUtilsExports.useErrorHandler,
  sanitizeInput: errorUtilsExports.sanitizeInput,
  sanitizeObject: errorUtilsExports.sanitizeObject,

  saveQuestionnaireData: servicesExports.saveQuestionnaireData,
  getQuestionnaireData: servicesExports.getQuestionnaireData,
  getMockUser: servicesExports.getMockUser,

  ESGHistoricalDataPoint: esgDataServicesExports.ESGHistoricalDataPoint,
  ESGDataPoint: esgDataServicesExports.ESGDataPoint,
  ESGFrameworkMapping: esgDataServicesExports.ESGFrameworkMapping,
  PaginationParams: esgDataServicesExports.PaginationParams,
  PaginatedResponse: esgDataServicesExports.PaginatedResponse,
  getESGDataPoints: esgDataServicesExports.getESGDataPoints,
  getAllESGDataPoints: esgDataServicesExports.getAllESGDataPoints,
  getESGFrameworkMappings: esgDataServicesExports.getESGFrameworkMappings,
  saveESGDataPoint: esgDataServicesExports.saveESGDataPoint,
  deleteESGDataPoint: esgDataServicesExports.deleteESGDataPoint,
  saveESGFrameworkMapping: esgDataServicesExports.saveESGFrameworkMapping,
  deleteESGFrameworkMapping: esgDataServicesExports.deleteESGFrameworkMapping,
  getUserESGDataPoints: esgDataServicesExports.getUserESGDataPoints,
  searchESGDataPoints: esgDataServicesExports.searchESGDataPoints,
  getMetricFrameworkRecommendations: esgDataServicesExports.getFrameworkRecommendations,
  getFrameworkMappingsByFrameworkId: esgDataServicesExports.getFrameworkMappings,

  TailoredRecommendationsRequest: tailoredRecommendationsExports.TailoredRecommendationsRequest,
  TailoredRecommendationsResponse: tailoredRecommendationsExports.TailoredRecommendationsResponse,
  ParsedRecommendations: tailoredRecommendationsExports.ParsedRecommendations,
  MaterialityTopic: tailoredRecommendationsExports.MaterialityTopic,
  FrameworkRecommendation: tailoredRecommendationsExports.FrameworkRecommendation,
  ImplementationStep: tailoredRecommendationsExports.ImplementationStep,
  ResourceRecommendation: tailoredRecommendationsExports.ResourceRecommendation,
  getTailoredRecommendations: tailoredRecommendationsExports.getTailoredRecommendations,
  parseRecommendations: tailoredRecommendationsExports.parseRecommendations,

  analyzeExternalContent: planEnhancementExports.analyzeExternalContent,
  searchResourceLibrary: planEnhancementExports.searchResourceLibrary,
  generateAIRecommendations: planEnhancementExports.generateAIRecommendations,

  StripeKeyProvider: StripeKeyProviderDefault,
  useStripeKey: useStripeKeyDefault,
};

export default libExports;
