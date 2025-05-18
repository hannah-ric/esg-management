import {
  analyzeExternalContent,
  searchResourceLibrary,
  generateAIRecommendations,
} from "./plan-enhancement";

// Export named functions
export {
  analyzeExternalContent,
  searchResourceLibrary,
  generateAIRecommendations,
};

// Create a single default export object
const planEnhancement = {
  analyzeExternalContent,
  searchResourceLibrary,
  generateAIRecommendations,
};

export default planEnhancement;
