import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { resetPassword } from "@/lib/auth";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        toast({
          title: "Reset failed",
          description: error.message || "Failed to send reset email",
          variant: "destructive",
        });
        return;
      }

      setSubmitted(true);
      toast({
        title: "Email sent",
        description: "Check your email for a password reset link.",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      let errorMessage = "Failed to send reset email. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof (error as { message?: string }).message === 'string') {
        errorMessage = (error as { message: string }).message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
        <p className="mb-6">
          If an account exists with the email {email}, you will receive a
          password reset link shortly.
        </p>
        <Button
          onClick={() => setSubmitted(false)}
          variant="outline"
          className="w-full"
        >
          Back to Reset Form
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </div>
  );
}
