// Export all named exports from all lib modules
export type { AIAssistantResponse, CompanyProfile } from "./ai-services";
export {
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

export type {
  ESGHistoricalDataPoint,
  ESGDataPoint,
  ESGFrameworkMapping,
  PaginationParams,
  PaginatedResponse
} from "./esg-data-services";
export {
  getESGDataPoints,
  getAllESGDataPoints,
  getESGFrameworkMappings,
  saveESGDataPoint,
  deleteESGDataPoint,
  saveESGFrameworkMapping,
  deleteESGFrameworkMapping,
  getUserESGDataPoints,
  searchESGDataPoints,
  // getFrameworkRecommendations as getMetricFrameworkRecommendations, // Already exported from ai-services, avoid name clash or alias differently if needed
  // getFrameworkMappings as getFrameworkMappingsByFrameworkId
} from "./esg-data-services";

export type {
  TailoredRecommendationsRequest,
  TailoredRecommendationsResponse,
  ParsedRecommendations,
  MaterialityTopic,
  FrameworkRecommendation,
  ImplementationStep,
  ResourceRecommendation
} from "./tailored-recommendations";
export { 
  getTailoredRecommendations,
  parseRecommendations
} from "./tailored-recommendations";

export { analyzeExternalContent, searchResourceLibrary, generateAIRecommendations } from "./plan-enhancement";
export { StripeKeyProvider, useStripeKey } from "./stripe-key-provider";

// Import all the values that will be part of the default export
import { 
    getFrameworkRecommendations as getFrameworkRecommendations_ai,
    getResourceRecommendations as getResourceRecommendations_ai,
    getMaterialityBasedResources as getMaterialityBasedResources_ai,
    analyzeMaterialityTopics as analyzeMaterialityTopics_ai,
    getPeerBenchmarking as getPeerBenchmarking_ai,
    getESGDataInsights as getESGDataInsights_ai,
    analyzeMaterialityImpactForPlan as analyzeMaterialityImpactForPlan_ai,
    generateESGActionPlan as generateESGActionPlan_ai 
} from "./ai-services";
import { logger as logger_local } from "./logger";
import { cn as cn_utils, parseLocaleNumber as parseLocaleNumber_utils, formatLocaleNumber as formatLocaleNumber_utils } from "./utils";
import { withErrorHandling as withErrorHandling_errors, useErrorHandler as useErrorHandler_errors, sanitizeInput as sanitizeInput_errors, sanitizeObject as sanitizeObject_errors } from "./error-utils";
import { saveQuestionnaireData as saveQuestionnaireData_services, getQuestionnaireData as getQuestionnaireData_services, getMockUser as getMockUser_services } from "./services";
import {
    getESGDataPoints as getESGDataPoints_esg,
    getAllESGDataPoints as getAllESGDataPoints_esg,
    getESGFrameworkMappings as getESGFrameworkMappings_esg,
    saveESGDataPoint as saveESGDataPoint_esg,
    deleteESGDataPoint as deleteESGDataPoint_esg,
    saveESGFrameworkMapping as saveESGFrameworkMapping_esg,
    deleteESGFrameworkMapping as deleteESGFrameworkMapping_esg,
    getUserESGDataPoints as getUserESGDataPoints_esg,
    searchESGDataPoints as searchESGDataPoints_esg,
    getFrameworkRecommendations as getMetricFrameworkRecommendations_esg, // Aliased from esg-data-services
    getFrameworkMappings as getFrameworkMappingsByFrameworkId_esg      // Aliased from esg-data-services
} from "./esg-data-services";
import { 
    getTailoredRecommendations as getTailoredRecommendations_tailored,
    parseRecommendations as parseRecommendations_tailored 
} from "./tailored-recommendations";
import { analyzeExternalContent as analyzeExternalContent_plan, searchResourceLibrary as searchResourceLibrary_plan, generateAIRecommendations as generateAIRecommendations_plan } from "./plan-enhancement";
import { StripeKeyProvider as StripeKeyProvider_stripe, useStripeKey as useStripeKey_stripe } from "./stripe-key-provider";

const libExports = {
  getFrameworkRecommendations: getFrameworkRecommendations_ai,
  getResourceRecommendations: getResourceRecommendations_ai,
  getMaterialityBasedResources: getMaterialityBasedResources_ai,
  analyzeMaterialityTopics: analyzeMaterialityTopics_ai,
  getPeerBenchmarking: getPeerBenchmarking_ai,
  getESGDataInsights: getESGDataInsights_ai,
  analyzeMaterialityImpactForPlan: analyzeMaterialityImpactForPlan_ai,
  generateESGActionPlan: generateESGActionPlan_ai,
  logger: logger_local,
  cn: cn_utils,
  parseLocaleNumber: parseLocaleNumber_utils,
  formatLocaleNumber: formatLocaleNumber_utils,
  withErrorHandling: withErrorHandling_errors,
  useErrorHandler: useErrorHandler_errors,
  sanitizeInput: sanitizeInput_errors,
  sanitizeObject: sanitizeObject_errors,
  saveQuestionnaireData: saveQuestionnaireData_services,
  getQuestionnaireData: getQuestionnaireData_services,
  getMockUser: getMockUser_services,
  getESGDataPoints: getESGDataPoints_esg,
  getAllESGDataPoints: getAllESGDataPoints_esg,
  getESGFrameworkMappings: getESGFrameworkMappings_esg,
  saveESGDataPoint: saveESGDataPoint_esg,
  deleteESGDataPoint: deleteESGDataPoint_esg,
  saveESGFrameworkMapping: saveESGFrameworkMapping_esg,
  deleteESGFrameworkMapping: deleteESGFrameworkMapping_esg,
  getUserESGDataPoints: getUserESGDataPoints_esg,
  searchESGDataPoints: searchESGDataPoints_esg,
  getMetricFrameworkRecommendations: getMetricFrameworkRecommendations_esg,
  getFrameworkMappingsByFrameworkId: getFrameworkMappingsByFrameworkId_esg,
  getTailoredRecommendations: getTailoredRecommendations_tailored,
  parseRecommendations: parseRecommendations_tailored,
  analyzeExternalContent: analyzeExternalContent_plan,
  searchResourceLibrary: searchResourceLibrary_plan,
  generateAIRecommendations: generateAIRecommendations_plan,
  StripeKeyProvider: StripeKeyProvider_stripe,
  useStripeKey: useStripeKey_stripe,
};

export default libExports;
