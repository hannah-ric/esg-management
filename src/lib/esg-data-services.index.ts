// Export all named exports from esg-data-services.ts
export * from "./esg-data-services";

// Import the functions explicitly to include in the default export
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
  getFrameworkRecommendations,
  getFrameworkMappings,
} from "./esg-data-services";

// Create a default export for modules that need it
const esgDataServicesExports = {
  getESGDataPoints,
  getAllESGDataPoints,
  getESGFrameworkMappings,
  saveESGDataPoint,
  deleteESGDataPoint,
  saveESGFrameworkMapping,
  deleteESGFrameworkMapping,
  getUserESGDataPoints,
  searchESGDataPoints,
  getFrameworkRecommendations,
  getFrameworkMappings,
};

export default esgDataServicesExports;
