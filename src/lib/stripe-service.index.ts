import {
  stripeService,
  createPaymentIntent,
  confirmPaymentIntent,
  createSubscription,
} from "./stripe-service";

export {
  stripeService,
  createPaymentIntent,
  confirmPaymentIntent,
  createSubscription,
};

// Create a single default export object
const stripeServiceExports = {
  stripeService,
  createPaymentIntent,
  confirmPaymentIntent,
  createSubscription,
};

export default stripeServiceExports;
