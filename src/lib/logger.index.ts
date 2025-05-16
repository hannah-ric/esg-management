// Export all named exports from logger.ts
export * from "./logger";

// Import the logger explicitly to include in the default export
import { logger } from "./logger";

// Create a default export for modules that need it
const loggerExports = {
  logger,
};

export default loggerExports;
