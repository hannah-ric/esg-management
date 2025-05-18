// Import the functions and types explicitly to include in the default export
import {
  ESGHistoricalDataPoint, // Interface
  ESGDataPoint, // Interface
  ESGFrameworkMapping, // Interface
  ESGFramework,
  PaginationParams, // Interface
  PaginatedResponse, // Interface
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
  getFrameworkRecommendations, // Original name from esg-data-services.ts
  getFrameworkMappings, // Original name from esg-data-services.ts
} from "./esg-data-services";

// Export types
export type {
  ESGHistoricalDataPoint,
  ESGDataPoint,
  ESGFrameworkMapping,
  ESGFramework,
  PaginationParams,
  PaginatedResponse,
};

// Export named functions
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
  getFrameworkRecommendations,
  getFrameworkMappings,
};

// Create a single default export object
const esgDataServices = {
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
  getFrameworkRecommendations,
  getFrameworkMappings,
};

export default esgDataServices;
