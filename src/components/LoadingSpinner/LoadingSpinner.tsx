import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner = ({
  size = "md",
  className = "",
}: LoadingSpinnerProps) => {
  if (size === "sm") {
    return <Loader2 className={`h-4 w-4 animate-spin ${className}`} />;
  }

  const sizeClass = size === "lg" ? "h-20 w-20" : "h-16 w-16";

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div
          className={`${sizeClass} rounded-full border-t-4 border-b-4 border-primary animate-spin`}
        ></div>
        <div
          className={`absolute top-0 left-0 ${sizeClass} rounded-full border-t-4 border-b-4 border-primary opacity-60 animate-ping`}
        ></div>
      </div>
      <span className="ml-4 text-lg font-medium">Loading...</span>
    </div>
  );
};
