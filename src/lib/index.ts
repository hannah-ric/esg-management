// Export all named exports from all lib modules
export * from "./ai-services";
export * from "./logger";
export * from "./utils";
export * from "./error-utils";
export * from "./services";
export * from "./esg-data-services";
export * from "./tailored-recommendations";
export * from "./plan-enhancement";
export * from "./stripe-key-provider";

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

// Create a default export for modules that need it
const libExports = {
  // AI Services exports
  getFrameworkRecommendations,
  getResourceRecommendations,
  getMaterialityBasedResources,
  analyzeMaterialityTopics,
  getPeerBenchmarking,
  getESGDataInsights,
  analyzeMaterialityImpactForPlan,
  generateESGActionPlan,

  // Include other module exports
  ...loggerExports,
  ...utilsExports,
  ...errorUtilsExports,
  ...servicesExports,
  ...esgDataServicesExports,
  ...tailoredRecommendationsExports,
  ...planEnhancementExports,
  ...stripeKeyExports,
};

export default libExports;
