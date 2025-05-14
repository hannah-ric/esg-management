import { useAuthContext } from "../AuthProvider";
import SignOutButton from "./SignOutButton";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export default function AuthStatus() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
          Sign In
        </Button>
        <Button size="sm" onClick={() => navigate("/signup")}>
          Sign Up
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-sm">
        <span className="font-medium">
          {user.user_metadata?.first_name || user.email}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
        Profile
      </Button>
      <SignOutButton variant="outline" size="sm" />
    </div>
  );
}
