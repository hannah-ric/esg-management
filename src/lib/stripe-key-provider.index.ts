import { StripeKeyProvider, useStripeKey } from "./stripe-key-provider";
import type { StripeKeyProviderProps } from "./stripe-key-provider";

export { StripeKeyProvider, useStripeKey };
export type { StripeKeyProviderProps };

// Use direct default export instead of intermediate variable
export default {
  StripeKeyProvider,
  useStripeKey,
};
