// Import the functions explicitly to include in the default export
import {
  saveQuestionnaireData,
  getQuestionnaireData,
  getMockUser,
} from "./services";

// Create a default export for modules that need it
const servicesExports = {
  saveQuestionnaireData,
  getQuestionnaireData,
  getMockUser,
};

export default servicesExports;
