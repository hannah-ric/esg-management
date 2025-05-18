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

export default {
  stripeService,
  createPaymentIntent,
  confirmPaymentIntent,
  createSubscription,
};

export * from "./cors";
// Add this line:
export { default } from "./cors";
