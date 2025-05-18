import {
  stripeConfig,
  validateStripeConfig,
  validateWebhookConfig,
  handleStripeCorsRequest,
  stripe,
} from "./stripe-config";

// Export named functions and objects
export {
  stripeConfig,
  validateStripeConfig,
  validateWebhookConfig,
  handleStripeCorsRequest,
  stripe,
};

// Create a single default export object
const stripeConfigExports = {
  stripeConfig,
  validateStripeConfig,
  validateWebhookConfig,
  handleStripeCorsRequest,
  stripe,
};

export default stripeConfigExports;
