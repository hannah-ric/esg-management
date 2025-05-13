import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Globe } from "lucide-react";
import { Button } from "./ui/button";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-primary" />
            <Link to="/" className="font-bold text-xl">
              ESG Plan Generator
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
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Log In
            </Button>
            <Button size="sm">Sign Up</Button>
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
