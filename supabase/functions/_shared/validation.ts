/**
 * Validates that required fields are present in the request data
 * @param data Request data object
 * @param requiredFields Array of required field names
 * @returns Error message if validation fails, null if successful
 */
export const validateRequiredFields = (
  data: Record<string, any>,
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
