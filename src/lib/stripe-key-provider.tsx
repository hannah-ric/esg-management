import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import { logger } from "./logger";

interface StripeKeyContextType {
  publishableKey: string | null;
  loading: boolean;
  error: string | null;
  isMockMode: boolean;
}

const StripeKeyContext = createContext<StripeKeyContextType | undefined>(
  undefined,
);

type StripeKeyProviderProps = {
  children: React.ReactNode;
};

export const StripeKeyProvider: React.FC<StripeKeyProviderProps> = ({
  children,
}) => {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        // Fetch from Supabase edge function
        const { data, error } = await supabase.functions.invoke(
          "supabase-functions-get-stripe-key",
          {
            method: "GET",
          },
        );

        if (error) throw new Error(error.message);
        if (!data || !data.publishableKey)
          throw new Error("Stripe key not found");

        logger.info("Retrieved Stripe key", { source: data.source });
        setPublishableKey(data.publishableKey);
        setIsMockMode(false);
      } catch (err) {
        logger.error("Error fetching Stripe key", err);
        setError("Failed to load payment system. Please try again later.");

        // Fallback to environment variable as last resort
        const fallbackKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (fallbackKey && !fallbackKey.includes("mock-key")) {
          logger.info("Using fallback key from environment variables");
          setPublishableKey(fallbackKey);
          setIsMockMode(false);
        } else {
          // If no valid key is found, fall back to mock mode
          logger.info("Falling back to mock mode due to missing valid key");
          setPublishableKey("pk_test_mockstripekey123456789");
          setIsMockMode(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStripeKey();
  }, []);

  return (
    <StripeKeyContext.Provider value={{ publishableKey, loading, error, isMockMode }}>
      {children}
    </StripeKeyContext.Provider>
  );
};

export const useStripeKey = () => {
  const context = useContext(StripeKeyContext);
  if (context === undefined) {
    throw new Error("useStripeKey must be used within a StripeKeyProvider");
  }
  return context;
};
