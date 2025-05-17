// import React from "react"; // Unused
import { Loader2 } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
        <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-primary opacity-60 animate-ping"></div>
      </div>
      <span className="ml-4 text-lg font-medium">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
