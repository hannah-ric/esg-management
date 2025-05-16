import React from "react";
import { Button } from "./ui/button";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-red-600">
          Something went wrong
        </h2>
        <div className="p-4 mb-4 text-sm bg-red-50 border border-red-200 rounded-md">
          <p className="font-medium">Error message:</p>
          <p className="mt-1 text-red-800">
            {error.message || "An unknown error occurred"}
          </p>
        </div>
        <Button
          onClick={resetErrorBoundary}
          className="w-full"
          variant="destructive"
        >
          Try again
        </Button>
      </div>
    </div>
  );
};

export default ErrorFallback;
