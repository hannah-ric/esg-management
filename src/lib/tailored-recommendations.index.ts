// Import the functions and types explicitly to include in the default export
import {
  TailoredRecommendationsRequest, // Interface
  TailoredRecommendationsResponse, // Interface
  ParsedRecommendations, // Interface
  MaterialityTopic, // Interface
  FrameworkRecommendation, // Interface
  ImplementationStep, // Interface
  ResourceRecommendation, // Interface
  getTailoredRecommendations,
  parseRecommendations,
} from "./tailored-recommendations";

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

// Add a default export with all the functions
export default {
  getTailoredRecommendations,
  parseRecommendations,
};
