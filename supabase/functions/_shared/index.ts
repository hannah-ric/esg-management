// Main index file for shared modules
// Export all named exports from each module
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

import * as cors from "./cors.index";
import * as errorHandler from "./error-handler.index";
import * as validation from "./validation.index";
import * as cacheModule from "./cache.index";
import * as stripeConfigModule from "./stripe-config.index";

const shared = {
  ...cors,
  ...errorHandler,
  ...validation,
  ...cacheModule,
  ...stripeConfigModule,
};

export default shared;
