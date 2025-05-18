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

export type {
  ESGHistoricalDataPoint,
  ESGDataPoint,
  ESGFrameworkMapping,
  ESGFramework,
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
  getFrameworkRecommendations,
  getFrameworkMappings,
};

// Use direct default export instead of intermediate variable
export default {
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
