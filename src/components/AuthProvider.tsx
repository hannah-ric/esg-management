import React, { createContext, useContext } from "react";
import { useAuth, AuthState } from "../lib/auth";

// Create auth context
const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  loading: true,
});

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuthContext() {
  return useContext(AuthContext);
}
