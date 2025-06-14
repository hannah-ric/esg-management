import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import { logger } from "./logger";

interface StripeKeyContextType {
  publishableKey: string | null;
  loading: boolean;
  error: string | null;
  isMockMode: boolean;
}

const StripeKeyContext = createContext<StripeKeyContextType>({
  publishableKey: null,
  loading: true,
  error: null,
  isMockMode: false,
});

export type StripeKeyProviderProps = {
  children: React.ReactNode;
};

export function StripeKeyProvider({ children }: StripeKeyProviderProps) {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (envKey) {
          logger.info("Using Stripe key from environment variables");
          setPublishableKey(envKey);
          setIsMockMode(envKey.includes("pk_test_"));
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke(
          "supabase-functions-get-stripe-key",
          { method: "GET" },
        );

        if (error) {
          logger.error("Supabase function error:", error);
          throw new Error(`Edge function error: ${error.message}`);
        }

        if (!data) {
          throw new Error("No data returned from edge function");
        }

        const key = data.publishableKey || data.publicKey;
        if (!key) {
          throw new Error("Stripe key not found in response");
        }

        logger.info("Retrieved Stripe key", { source: data.source });
        setPublishableKey(key);
        setIsMockMode(key.includes("pk_test_"));
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error("Error fetching Stripe key", errorMessage);
        setError(`Payment system error: ${errorMessage}`);

        // If no valid key is found, fall back to mock mode
        logger.info("Falling back to mock mode due to missing valid key");
        setPublishableKey("pk_test_mockstripekey123456789");
        setIsMockMode(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStripeKey();
  }, []);

  return (
    <StripeKeyContext.Provider
      value={{ publishableKey, loading, error, isMockMode }}
    >
      {children}
    </StripeKeyContext.Provider>
  );
}

// Export the hook directly as a named function
// This improves HMR compatibility
export function useStripeKey() {
  const context = useContext(StripeKeyContext);
  if (!context) {
    throw new Error("useStripeKey must be used within a StripeKeyProvider");
  }
  return context;
}
