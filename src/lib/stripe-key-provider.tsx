import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

interface StripeKeyContextType {
  publishableKey: string | null;
  loading: boolean;
  error: string | null;
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

        console.log(`Retrieved Stripe key from ${data.source}`);
        setPublishableKey(data.publishableKey);
      } catch (err) {
        console.error("Error fetching Stripe key:", err);
        setError("Failed to load payment system key. Please try again later.");

        // Fallback to environment variable as last resort
        const fallbackKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (fallbackKey && fallbackKey !== "") {
          console.log("Using fallback key from environment variables");
          setPublishableKey(fallbackKey);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStripeKey();
  }, []);

  return (
    <StripeKeyContext.Provider value={{ publishableKey, loading, error }}>
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
