// Export all named exports from cors module
import { corsHeaders, setCorsHeaders, handleCors } from "./cors";

// Export named functions
export { corsHeaders, setCorsHeaders, handleCors };

// Create a single default export object
const corsExports = {
  corsHeaders,
  setCorsHeaders,
  handleCors,
};

export default corsExports;
