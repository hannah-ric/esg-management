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

// Audit Log
import type { AuditLogEntry, AuditLogFilters } from "./audit-log";
import {
  recordAuditLog,
  queryAuditLogs,
  exportAuditLogsCsv,
  exportAuditLogsPdf,
} from "./audit-log";

// Framework Mapping
import type { FrameworkDefinition, FrameworkMetric } from "./framework-mapping";
import { loadFrameworkDefinition, compareFrameworks } from "./framework-mapping";

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
  cancelSubscription,
} from "./stripe-service";

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
export type {
  AnalyzedContentDataPoint,
  AnalyzedContentFrameworkMapping,
  AnalyzedContentESGData,
  AnalyzedContentResult,
  EnhancedPlanData,
} from "./plan-enhancement";
export { StripeKeyProvider, useStripeKey };
export {
  createPaymentIntent,
  confirmPaymentIntent,
  createSubscription,
  cancelSubscription,
};

export type { FrameworkDefinition, FrameworkMetric } from "./framework-mapping";
export { loadFrameworkDefinition, compareFrameworks } from "./framework-mapping";

export type { AuditLogEntry, AuditLogFilters } from "./audit-log";
export {
  recordAuditLog,
  queryAuditLogs,
  exportAuditLogsCsv,
  exportAuditLogsPdf,
} from "./audit-log";


