// Export all named exports from tailored-recommendations.ts
export * from "./tailored-recommendations";

// Import the functions explicitly to include in the default export
import {
  getTailoredRecommendations,
  parseRecommendations,
} from "./tailored-recommendations";

// Create a default export for modules that need it
const tailoredRecommendationsExports = {
  getTailoredRecommendations,
  parseRecommendations,
};

export default tailoredRecommendationsExports;
