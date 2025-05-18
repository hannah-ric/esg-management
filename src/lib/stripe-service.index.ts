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

// Use direct default export instead of intermediate variable
export default {
  stripeService,
  createPaymentIntent,
  confirmPaymentIntent,
  createSubscription,
};
