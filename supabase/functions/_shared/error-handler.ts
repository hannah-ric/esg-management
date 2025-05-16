import { corsHeaders } from "./cors.ts";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export function handleError(error: unknown, status = 500): Response {
  console.error("Error:", error);

  let errorMessage = "An unexpected error occurred";
  let errorCode = "INTERNAL_ERROR";
  let details = undefined;

  if (error instanceof ApiError) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (error instanceof Error) {
    errorMessage = error.message;
    // Extract error code if available (e.g., from API responses)
    if ("code" in error && typeof (error as any).code === "string") {
      errorCode = (error as any).code;
    }

    // Include stack trace in development
    if (Deno.env.get("ENVIRONMENT") === "development") {
      details = error.stack;
    }
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error === "object") {
    if ("message" in error && typeof (error as any).message === "string") {
      errorMessage = (error as any).message;
    } else {
      errorMessage = JSON.stringify(error);
    }

    if ("code" in error && typeof (error as any).code === "string") {
      errorCode = (error as any).code;
    }

    details = error;
  }

  const errorResponse: ErrorResponse = {
    error: errorMessage,
    code: errorCode,
  };

  if (details) {
    errorResponse.details = details;
  }

  return new Response(JSON.stringify(errorResponse), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

export function handleValidationError(message: string): Response {
  return handleError({ message, code: "VALIDATION_ERROR" }, 400);
}

export function handleNotFoundError(message: string): Response {
  return handleError({ message, code: "NOT_FOUND" }, 404);
}

export function handleAuthError(message: string): Response {
  return handleError({ message, code: "UNAUTHORIZED" }, 401);
}
