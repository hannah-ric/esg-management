import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../AppContext";

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = "/login" }: AuthGuardProps) {
  const { user, loading } = useAppContext();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
}

interface GuestGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function GuestGuard({
  children,
  redirectTo = "/dashboard",
}: GuestGuardProps) {
  const { user, loading } = useAppContext();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if not authenticated
  return <>{children}</>;
}
