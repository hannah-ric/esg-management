/**
 * This file provides mock authentication functionality for development environments
 * It allows the application to function without requiring a real Supabase connection
 */

// Mock user data
export const mockUser = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "demo@example.com",
  user_metadata: {
    first_name: "Demo",
    last_name: "User",
    company_name: "Demo Company",
  },
  app_metadata: {},
  created_at: new Date().toISOString(),
};

// Mock session data
export const mockSession = {
  access_token: "mock_access_token",
  refresh_token: "mock_refresh_token",
  expires_at: Date.now() + 3600 * 1000,
  user: mockUser,
};

// Mock authentication functions
export const mockSignIn = () =>
  Promise.resolve({
    data: { session: mockSession, user: mockUser },
    error: null,
  });
export const mockSignOut = () => Promise.resolve({ error: null });
export const mockSignUp = () =>
  Promise.resolve({
    data: { session: mockSession, user: mockUser },
    error: null,
  });
export const mockResetPassword = () => Promise.resolve({ error: null });
export const mockUpdateProfile = () =>
  Promise.resolve({
    user: mockUser,
    error: null,
  });

// Helper to determine if we're using mock auth
export const isMockAuth = () => {
  // Use mock auth if:
  // 1. We're in development mode
  // 2. We're explicitly in mock mode via environment variable
  return (
    import.meta.env.DEV === true ||
    import.meta.env.VITE_USE_MOCK_AUTH === "true"
  );
};
