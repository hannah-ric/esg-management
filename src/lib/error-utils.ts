import { logger } from "./logger";
import { useToast } from "@/components/ui/use-toast";

/**
 * Utility function for handling async operations with consistent error handling
 * @param operation Async operation to perform
 * @param errorMessage Error message to log and display if operation fails
 * @param showToast Whether to show a toast notification for errors
 * @returns Result of the operation or null if it failed
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  showToast: boolean = false
): Promise<{ data: T | null; error: string | null }> {
  try {
    const result = await operation();
    return { data: result, error: null };
  } catch (err) {
    logger.error(errorMessage, err);
    
    if (showToast) {
      // Note: This won't work in actual code because hooks can't be used outside of components
      // It's included for reference, but should be implemented differently in real usage
      // e.g., pass in a toast function from the component
      return { data: null, error: err.message || errorMessage };
    }
    
    return { data: null, error: err.message || errorMessage };
  }
}

/**
 * Component hook for handling error-prone operations
 * @returns Object with utility functions for error handling
 */
export function useErrorHandler() {
  const { toast } = useToast();
  
  /**
   * Runs an async operation with error handling and optional toast notification
   */
  const handleAsync = async <T>(
    operation: () => Promise<T>,
    options: {
      errorMessage: string;
      successMessage?: string;
      showErrorToast?: boolean;
      showSuccessToast?: boolean;
    }
  ): Promise<{ data: T | null; error: string | null }> => {
    try {
      const result = await operation();
      
      if (options.showSuccessToast && options.successMessage) {
        toast({
          title: "Success",
          description: options.successMessage,
        });
      }
      
      return { data: result, error: null };
    } catch (err) {
      logger.error(options.errorMessage, err);
      
      if (options.showErrorToast) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || options.errorMessage,
        });
      }
      
      return { data: null, error: err.message || options.errorMessage };
    }
  };
  
  return { handleAsync };
} 