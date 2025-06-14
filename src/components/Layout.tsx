import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Globe, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/components/AppContext";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Layout = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      setIsAuthDialogOpen(false);
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      let message = "Invalid email or password. Please try again.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!email || !password || !firstName || !lastName) {
        throw new Error("Please fill in all required fields");
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            company_name: companyName,
          },
        },
      });
      if (signUpError) throw signUpError;

      setIsAuthDialogOpen(false);
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setCompanyName("");

      alert(
        "Account created successfully! Please check your email to confirm your account before logging in.",
      );
      setAuthTab("login");
    } catch (err) {
      console.error("Signup error:", err);
      let message = "Failed to create account. Please try again.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
    navigate("/");
  };

  const getUserInitials = () => {
    if (!user?.firstName && !user?.lastName) return "U";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-primary" />
            <Link to="/" className="font-bold text-xl">
              Impactly
            </Link>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link
              to="/questionnaire"
              className="text-sm font-medium hover:text-primary"
            >
              Questionnaire
            </Link>
            <Link
              to="/materiality-matrix"
              className="text-sm font-medium hover:text-primary"
            >
              Materiality Matrix
            </Link>
            <Link
              to="/plan-generator"
              className="text-sm font-medium hover:text-primary"
            >
              Plan Generator
            </Link>
            <Link
              to="/resources"
              className="text-sm font-medium hover:text-primary"
            >
              Resources
            </Link>
            <Link
              to="/benchmarking"
              className="text-sm font-medium hover:text-primary"
            >
              Benchmarking
            </Link>
            <Link
              to="/esg-data"
              className="text-sm font-medium hover:text-primary"
            >
              ESG Data
            </Link>
            <Link
              to="/esg-metrics"
              className="text-sm font-medium hover:text-primary"
            >
              ESG Metrics
            </Link>
            <Link
              to="/advisory-services"
              className="text-sm font-medium hover:text-primary"
            >
              Advisory Services
            </Link>
            <Link
              to="/implementation-support"
              className="text-sm font-medium hover:text-primary"
            >
              Implementation Support
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.firstName && user.lastName && (
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                      )}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Dialog
                open={isAuthDialogOpen}
                onOpenChange={setIsAuthDialogOpen}
              >
                <DialogTrigger asChild>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAuthTab("login");
                        setIsAuthDialogOpen(true);
                      }}
                    >
                      Log In
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setAuthTab("signup");
                        setIsAuthDialogOpen(true);
                      }}
                    >
                      Sign Up
                    </Button>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Account</DialogTitle>
                  </DialogHeader>
                  <Tabs
                    defaultValue={authTab}
                    value={authTab}
                    onValueChange={(value) =>
                      setAuthTab(value as "login" | "signup")
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login" className="space-y-4 pt-4">
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        {error && (
                          <p className="text-sm text-destructive">{error}</p>
                        )}
                        <div className="space-y-2">
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                          >
                            {isLoading ? "Logging in..." : "Log In"}
                          </Button>
                          <div className="text-sm text-center">
                            <button
                              type="button"
                              onClick={() => setAuthTab("signup")}
                              className="text-primary hover:underline"
                            >
                              Don&apos;t have an account? Sign up
                            </button>
                          </div>
                        </div>
                      </form>
                    </TabsContent>
                    <TabsContent value="signup" className="space-y-4 pt-4">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input
                            id="companyName"
                            placeholder="Acme Corp"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signupEmail">Email</Label>
                          <Input
                            id="signupEmail"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signupPassword">Password</Label>
                          <Input
                            id="signupPassword"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        {error && (
                          <p className="text-sm text-destructive">{error}</p>
                        )}
                        <div className="space-y-2">
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                          >
                            {isLoading ? "Creating account..." : "Sign Up"}
                          </Button>
                          <div className="text-sm text-center">
                            <button
                              type="button"
                              onClick={() => setAuthTab("login")}
                              className="text-primary hover:underline"
                            >
                              Already have an account? Log in
                            </button>
                          </div>
                        </div>
                      </form>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © {new Date().getFullYear()} ESG Plan Generator. All rights
              reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                to="/cookies"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
