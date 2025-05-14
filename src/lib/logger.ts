const isDevelopment = import.meta.env.DEV;

// Create a timestamp for logs
const getTimestamp = () => {
  return new Date().toISOString();
};

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(`[${getTimestamp()}] INFO: ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`[${getTimestamp()}] WARN: ${message}`, ...args.map(sanitizeData));
  },
  
  error: (message: string, error: any, ...args: any[]) => {
    // In production, log minimal info
    if (!isDevelopment) {
      console.error(`[${getTimestamp()}] ERROR: ${message}`, sanitizeError(error), ...args.map(sanitizeData));
    } else {
      console.error(`[${getTimestamp()}] ERROR: ${message}`, error, ...args);
    }

    // Here we could also send error to an error tracking service like Sentry
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }
};

// Sanitize sensitive data before logging
function sanitizeData(data: any): any {
  if (!data) return data;
  
  // If it's an object, recursively sanitize
  if (typeof data === 'object') {
    const sanitized = { ...data };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitizeData(sanitized[key]);
      }
    });
    
    return sanitized;
  }
  
  return data;
}

// Extract only useful parts of an error for logging
function sanitizeError(error: any): any {
  if (!error) return error;
  
  // If it's a string, return as is
  if (typeof error === 'string') return error;
  
  // If it has a message property, use that
  if (error.message) {
    return {
      message: error.message,
      name: error.name,
      code: error.code
    };
  }
  
  return error;
} 