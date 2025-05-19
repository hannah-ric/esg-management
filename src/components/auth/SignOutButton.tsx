import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { signOut } from "@/lib/auth";

interface SignOutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function SignOutButton({
  variant = "default",
  size = "default",
  className = "",
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setIsLoading(true);

    try {
      const { error } = await signOut();

      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message || "Failed to sign out",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      let errorMessage = "Failed to sign out. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof (error as { message?: string }).message === 'string') {
        errorMessage = (error as { message: string }).message;
      }
      toast({
        title: "Sign out failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
