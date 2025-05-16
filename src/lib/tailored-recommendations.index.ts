// Import the functions and types explicitly to include in the default export
import {
  TailoredRecommendationsRequest, // Interface
  TailoredRecommendationsResponse, // Interface
  ParsedRecommendations,          // Interface
  MaterialityTopic,               // Interface
  FrameworkRecommendation,        // Interface
  ImplementationStep,             // Interface
  ResourceRecommendation,         // Interface
  getTailoredRecommendations,
  parseRecommendations,
} from "./tailored-recommendations";

// Create a default export for modules that need it
const tailoredRecommendationsExports = {
  TailoredRecommendationsRequest,
  TailoredRecommendationsResponse,
  ParsedRecommendations,
  MaterialityTopic,
  FrameworkRecommendation,
  ImplementationStep,
  ResourceRecommendation,
  getTailoredRecommendations,
  parseRecommendations,
};

export default tailoredRecommendationsExports;
