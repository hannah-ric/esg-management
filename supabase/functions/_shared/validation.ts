/**
 * Validates that required fields are present in the request body
 * @param data The request data to validate
 * @param requiredFields Array of field names that must be present
 * @returns An error message if validation fails, or null if validation passes
 */
export function validateRequiredFields<T>(
  data: T,
  requiredFields: (keyof T)[],
): string | null {
  const missingFields = requiredFields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === "";
  });

  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(", ")}`;
  }

  return null;
}

/**
 * Validates that a string field meets minimum and maximum length requirements
 * @param value The string value to validate
 * @param fieldName The name of the field (for error messages)
 * @param minLength Minimum required length
 * @param maxLength Maximum allowed length
 * @returns An error message if validation fails, or null if validation passes
 */
export function validateStringLength(
  value: string | undefined | null,
  fieldName: string,
  minLength = 1,
  maxLength = Number.MAX_SAFE_INTEGER,
): string | null {
  if (value === undefined || value === null) {
    return `${fieldName} is required`;
  }

  if (typeof value !== "string") {
    return `${fieldName} must be a string`;
  }

  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }

  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }

  return null;
}

/**
 * Validates that a value is a valid email address
 * @param email The email address to validate
 * @returns An error message if validation fails, or null if validation passes
 */
export function validateEmail(email: string | undefined | null): string | null {
  if (!email) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  return null;
}

/**
 * Validates that a date string is in a valid format and within an acceptable range
 * @param dateStr The date string to validate
 * @param fieldName The name of the field (for error messages)
 * @param minDate Optional minimum allowed date
 * @param maxDate Optional maximum allowed date
 * @returns An error message if validation fails, or null if validation passes
 */
export function validateDate(
  dateStr: string | undefined | null,
  fieldName: string,
  minDate?: Date,
  maxDate?: Date,
): string | null {
  if (!dateStr) {
    return `${fieldName} is required`;
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return `${fieldName} is not a valid date`;
  }

  if (minDate && date < minDate) {
    return `${fieldName} must be on or after ${minDate.toISOString().split("T")[0]}`;
  }

  if (maxDate && date > maxDate) {
    return `${fieldName} must be on or before ${maxDate.toISOString().split("T")[0]}`;
  }

  return null;
}
