import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import { isMockAuth } from "./mock-auth";

interface ClerkKeyContextType {
  publishableKey: string | null;
  loading: boolean;
  error: string | null;
  isMockMode: boolean;
}

const ClerkKeyContext = createContext<ClerkKeyContextType | undefined>(
  undefined,
);

type ClerkKeyProviderProps = {
  children: (contextValue: ClerkKeyContextType) => React.ReactNode;
};

export const ClerkKeyProvider: React.FC<ClerkKeyProviderProps> = ({
  children,
}) => {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    const fetchClerkKey = async () => {
      try {
        if (isMockAuth()) {
          console.log("Using mock auth for development");
          // Use a valid format mock key for development
          setPublishableKey("pk_test_Y2xlcmsuZGV2ZWxvcG1lbnQubW9jay5rZXk");
          setIsMockMode(true);
          return;
        }

        // Fetch from Supabase edge function
        const { data, error } = await supabase.functions.invoke(
          "supabase-functions-get-clerk-key",
          {
            method: "GET",
          },
        );

        if (error) throw new Error(error.message);
        if (!data || !data.publishableKey)
          throw new Error("Clerk key not found");

        console.log(`Retrieved Clerk key from ${data.source}`);
        setPublishableKey(data.publishableKey);
        setIsMockMode(false);
      } catch (err) {
        console.error("Error fetching Clerk key:", err);
        setError("Failed to load authentication key. Please try again later.");

        // Fallback to environment variable as last resort
        const fallbackKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
        if (fallbackKey && !fallbackKey.includes("mock-key")) {
          console.log("Using fallback key from environment variables");
          setPublishableKey(fallbackKey);
          setIsMockMode(false);
        } else {
          // If no valid key is found, fall back to mock mode
          console.log("Falling back to mock mode due to missing valid key");
          setPublishableKey("pk_test_Y2xlcmsuZGV2ZWxvcG1lbnQubW9jay5rZXk=");
          setIsMockMode(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClerkKey();
  }, []);

  const contextValue = { publishableKey, loading, error, isMockMode };

  // Render children as a function with the context value
  return <>{children(contextValue)}</>;
};

export const useClerkKey = () => {
  const context = useContext(ClerkKeyContext);
  if (context === undefined) {
    throw new Error("useClerkKey must be used within a ClerkKeyProvider");
  }
  return context;
};
