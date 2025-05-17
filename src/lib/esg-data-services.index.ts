// Import the functions and types explicitly to include in the default export
import {
  ESGHistoricalDataPoint, // Interface
  ESGDataPoint,           // Interface
  ESGFrameworkMapping,    // Interface
  PaginationParams,       // Interface
  PaginatedResponse,      // Interface
  getESGDataPoints,
  getAllESGDataPoints,
  getESGFrameworkMappings,
  saveESGDataPoint,
  deleteESGDataPoint,
  saveESGFrameworkMapping,
  deleteESGFrameworkMapping,
  getUserESGDataPoints,
  searchESGDataPoints,
  getFrameworkRecommendations, // Original name from esg-data-services.ts
  getFrameworkMappings,      // Original name from esg-data-services.ts
} from "./esg-data-services";

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
  getFrameworkRecommendations,
  getFrameworkMappings
} from "./esg-data-services";

// No default export, all are named exports now.
