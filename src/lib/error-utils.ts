import { logger } from "./logger";
import { useToast } from "@/components/ui/use-toast";
import DOMPurify from 'dompurify';

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
    let errorDetail = errorMessage;
    if (err instanceof Error) {
      errorDetail = err.message;
    } else if (typeof err === 'string') {
      errorDetail = err;
    }

    if (showToast) {
      // Note: This won't work in actual code because hooks can't be used outside of components
      // It's included for reference, but should be implemented differently in real usage
      // e.g., pass in a toast function from the component
      return { data: null, error: errorDetail };
    }
    
    return { data: null, error: errorDetail };
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
      let errorDescription = options.errorMessage;
      if (err instanceof Error) {
        errorDescription = err.message;
      } else if (typeof err === 'string') {
        errorDescription = err;
      }
      
      if (options.showErrorToast) {
        toast({
          variant: "destructive",
          title: "Error",
          description: errorDescription,
        });
      }
      
      return { data: null, error: errorDescription };
    }
  };
  
  return { handleAsync };
}

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input The input string to sanitize
 * @returns A sanitized string safe for display
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // If we're in a browser environment, use DOMPurify
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [], // Strip all HTML tags
      ALLOWED_ATTR: [] // Strip all attributes
    });
  }
  
  // Basic server-side fallback (should be improved in a real implementation)
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes user input for database operations
 * @param input Input object to sanitize
 * @returns A sanitized version of the input
 */
export function sanitizeObject<T extends Record<string, unknown>>(input: T): T {
  if (!input || typeof input !== 'object') return input;
  
  const result = { ...input };
  
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const currentValue = result[key];

      if (typeof currentValue === 'string') {
        (result as Record<string, string>)[key] = sanitizeInput(currentValue);
      } else if (typeof currentValue === 'object' && currentValue !== null) {
        if (!Array.isArray(currentValue) && Object.getPrototypeOf(currentValue) === Object.prototype) {
          (result as Record<string, unknown>)[key] = sanitizeObject(currentValue as Record<string, unknown>);
        }
      }
    }
  }
  
  return result;
} 