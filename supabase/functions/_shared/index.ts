// Main index file for shared modules
// Import and re-export named exports from each module
export { corsHeaders, setCorsHeaders, handleCors } from "./cors.index";
export {
  ApiError,
  ErrorResponse,
  handleError,
  handleValidationError,
  handleNotFoundError,
  handleAuthError,
} from "./error-handler.index";
export type {
  StripeWebhookEvent,
  StripePaymentIntent,
  StripeSubscription,
  PaymentIntentCreateParams,
  PaymentIntentConfirmParams,
  SubscriptionCreateParams,
} from "./stripe-types.index";
export { validateRequiredFields } from "./validation.index";
export { Cache, cache } from "./cache.index";
export {
  stripeConfig,
  validateStripeConfig,
  validateWebhookConfig,
  handleStripeCorsRequest,
  stripe,
} from "./stripe-config.index";
export type {
  PaginationParams,
  SortParams,
  FilterParams,
  ApiResponse,
  PaginatedResponse,
} from "./types.index";

// Import default exports from each module
import corsModule from "./cors.index";
import errorHandlerModule from "./error-handler.index";
import validationModule from "./validation.index";
import cacheModule from "./cache.index";
import stripeConfigModule from "./stripe-config.index";

// Create a single default export object that combines all module exports
const shared = {
  ...corsModule,
  ...errorHandlerModule,
  ...validationModule,
  ...cacheModule,
  ...stripeConfigModule,
};

export default shared;
