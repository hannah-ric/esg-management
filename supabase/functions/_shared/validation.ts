/**
 * Validates that required fields are present in the request data
 * @param data Request data object
 * @param requiredFields Array of required field names
 * @returns Error message if validation fails, null if successful
 */
export const validateRequiredFields = (
  data: Record<string, unknown>,
  requiredFields: string[],
): string | null => {
  if (!data || typeof data !== "object") {
    return "Request data is missing or invalid";
  }

  const missingFields = requiredFields.filter((field) => {
    const value = data[field];
    return (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    );
  });

  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(", ")}`;
  }

  return null;
};

/**
 * Validates that a string is a valid email address
 * @param email The email address to validate
 * @returns True if the email is valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates that a number is within a specified range
 * @param value The number to validate
 * @param min The minimum allowed value (inclusive)
 * @param max The maximum allowed value (inclusive)
 * @returns True if the number is within range, false otherwise
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
): boolean {
  return value >= min && value <= max;
}
