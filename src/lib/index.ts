// Export all named exports from all lib modules explicitly
// AI Services
import type { AIAssistantResponse, CompanyProfile } from "./ai-services";
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

// Logger
import { logger } from "./logger";

// Utils
import { cn, parseLocaleNumber, formatLocaleNumber } from "./utils";

// Error Utils
import {
  withErrorHandling,
  useErrorHandler,
  sanitizeInput,
  sanitizeObject,
} from "./error-utils";

// Services
import {
  saveQuestionnaireData,
  getQuestionnaireData,
  getMockUser,
} from "./services";

// ESG Data Services
import type {
  ESGHistoricalDataPoint,
  ESGDataPoint,
  ESGFrameworkMapping,
  PaginationParams,
  PaginatedResponse,
} from "./esg-data-services";
import {
  getESGDataPoints,
  getAllESGDataPoints,
  getESGFrameworkMappings,
  saveESGDataPoint,
  deleteESGDataPoint,
  saveESGFrameworkMapping,
  deleteESGFrameworkMapping,
  getUserESGDataPoints,
  searchESGDataPoints,
  getFrameworks,
  getFrameworkRecommendations as getMetricFrameworkRecommendations,
  getFrameworkMappings as getFrameworkMappingsByFrameworkId,
} from "./esg-data-services";

// Tailored Recommendations
import type {
  TailoredRecommendationsRequest,
  TailoredRecommendationsResponse,
  ParsedRecommendations,
  MaterialityTopic,
  FrameworkRecommendation,
  ImplementationStep,
  ResourceRecommendation,
} from "./tailored-recommendations";
import {
  getTailoredRecommendations,
  parseRecommendations,
} from "./tailored-recommendations";

// Plan Enhancement
import {
  analyzeExternalContent,
  searchResourceLibrary,
  generateAIRecommendations,
} from "./plan-enhancement";

// Stripe Key Provider
import { StripeKeyProvider, useStripeKey } from "./stripe-key-provider";

// Stripe Service
import {
  createPaymentIntent,
  confirmPaymentIntent,
  createSubscription,
} from "./stripe-service.index";

// Re-export all named exports
export type { AIAssistantResponse, CompanyProfile };
export {
  getFrameworkRecommendations,
  getResourceRecommendations,
  getMaterialityBasedResources,
  analyzeMaterialityTopics,
  getPeerBenchmarking,
  getESGDataInsights,
  analyzeMaterialityImpactForPlan,
  generateESGActionPlan,
};

export { logger };
export { cn, parseLocaleNumber, formatLocaleNumber };
export { withErrorHandling, useErrorHandler, sanitizeInput, sanitizeObject };
export { saveQuestionnaireData, getQuestionnaireData, getMockUser };

export type {
  ESGHistoricalDataPoint,
  ESGDataPoint,
  ESGFrameworkMapping,
  PaginationParams,
  PaginatedResponse,
};
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
  getFrameworks,
  getMetricFrameworkRecommendations,
  getFrameworkMappingsByFrameworkId,
};

export type {
  TailoredRecommendationsRequest,
  TailoredRecommendationsResponse,
  ParsedRecommendations,
  MaterialityTopic,
  FrameworkRecommendation,
  ImplementationStep,
  ResourceRecommendation,
};
export { getTailoredRecommendations, parseRecommendations };

export {
  analyzeExternalContent,
  searchResourceLibrary,
  generateAIRecommendations,
};
export { StripeKeyProvider, useStripeKey };
export { createPaymentIntent, confirmPaymentIntent, createSubscription };

// Import all the values that will be part of the default export
import {
  getFrameworkRecommendations as getFrameworkRecommendations_ai,
  getResourceRecommendations as getResourceRecommendations_ai,
  getMaterialityBasedResources as getMaterialityBasedResources_ai,
  analyzeMaterialityTopics as analyzeMaterialityTopics_ai,
  getPeerBenchmarking as getPeerBenchmarking_ai,
  getESGDataInsights as getESGDataInsights_ai,
  analyzeMaterialityImpactForPlan as analyzeMaterialityImpactForPlan_ai,
  generateESGActionPlan as generateESGActionPlan_ai,
} from "./ai-services";
import { logger as logger_local } from "./logger";
import {
  cn as cn_utils,
  parseLocaleNumber as parseLocaleNumber_utils,
  formatLocaleNumber as formatLocaleNumber_utils,
} from "./utils";
import {
  withErrorHandling as withErrorHandling_errors,
  useErrorHandler as useErrorHandler_errors,
  sanitizeInput as sanitizeInput_errors,
  sanitizeObject as sanitizeObject_errors,
} from "./error-utils";
import {
  saveQuestionnaireData as saveQuestionnaireData_services,
  getQuestionnaireData as getQuestionnaireData_services,
  getMockUser as getMockUser_services,
} from "./services";
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
  getFrameworks as getFrameworks_esg,
  getFrameworkRecommendations as getMetricFrameworkRecommendations_esg, // Aliased from esg-data-services
  getFrameworkMappings as getFrameworkMappingsByFrameworkId_esg, // Aliased from esg-data-services
} from "./esg-data-services";
import {
  getTailoredRecommendations as getTailoredRecommendations_tailored,
  parseRecommendations as parseRecommendations_tailored,
} from "./tailored-recommendations";
import {
  analyzeExternalContent as analyzeExternalContent_plan,
  searchResourceLibrary as searchResourceLibrary_plan,
  generateAIRecommendations as generateAIRecommendations_plan,
} from "./plan-enhancement";
import {
  StripeKeyProvider as StripeKeyProvider_stripe,
  useStripeKey as useStripeKey_stripe,
} from "./stripe-key-provider";
import {
  createPaymentIntent as createPaymentIntent_stripe,
  confirmPaymentIntent as confirmPaymentIntent_stripe,
  createSubscription as createSubscription_stripe,
} from "./stripe-service.index";

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
  getFrameworks: getFrameworks_esg,
  getMetricFrameworkRecommendations: getMetricFrameworkRecommendations_esg,
  getFrameworkMappingsByFrameworkId: getFrameworkMappingsByFrameworkId_esg,
  getTailoredRecommendations: getTailoredRecommendations_tailored,
  parseRecommendations: parseRecommendations_tailored,
  analyzeExternalContent: analyzeExternalContent_plan,
  searchResourceLibrary: searchResourceLibrary_plan,
  generateAIRecommendations: generateAIRecommendations_plan,
  StripeKeyProvider: StripeKeyProvider_stripe,
  useStripeKey: useStripeKey_stripe,
  createPaymentIntent: createPaymentIntent_stripe,
  confirmPaymentIntent: confirmPaymentIntent_stripe,
  createSubscription: createSubscription_stripe,
};

export default libExports;
