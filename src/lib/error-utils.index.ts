// Import the functions explicitly to include in the default export
import {
  withErrorHandling,
  useErrorHandler,
  sanitizeInput,
  sanitizeObject,
} from "./error-utils";

// Create a default export for modules that need it
const errorUtilsExports = {
  withErrorHandling,
  useErrorHandler,
  sanitizeInput,
  sanitizeObject,
};

export default errorUtilsExports;
