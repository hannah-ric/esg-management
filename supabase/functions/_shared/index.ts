// Main index file for shared modules
// In your barrel file
export * from "./cors";
export * from "./error-handler";
export * from "./stripe-types";

// Add this line to fix the error:
export { default } from "./cors";