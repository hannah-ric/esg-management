import { corsHeaders } from "./cors.index";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function handleError(error: unknown): Response {
  console.error("Error:", error);

  let message = "An unexpected error occurred";
  let status = 500;

  if (error instanceof ApiError) {
    message = error.message;
    status = error.status;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  // Handle Stripe errors
  if (error && typeof error === "object" && "type" in error) {
    const stripeError = error as {
      type: string;
      statusCode?: number;
      message?: string;
    };
    if (stripeError.statusCode) {
      status = stripeError.statusCode;
    }
    if (stripeError.message) {
      message = stripeError.message;
    }
  }

  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function handleValidationError(message: string): Response {
  return handleError(new ApiError(message, 400));
}

export function handleNotFoundError(message = "Resource not found"): Response {
  return handleError(new ApiError(message, 404));
}

export function handleAuthError(message = "Unauthorized"): Response {
  return handleError(new ApiError(message, 401));
}
