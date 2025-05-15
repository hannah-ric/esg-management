import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses a locale-specific number string (e.g., "1.234,56" or "1,234.56")
 * into a standard JavaScript number.
 * @param value The string value to parse.
 * @returns A number, or NaN if parsing fails.
 */
export function parseLocaleNumber(value: string | number | undefined | null): number {
  if (value === null || value === undefined || value === '') return NaN;
  if (typeof value === 'number') return value;

  // Remove thousands separators (both dot and comma)
  const cleanedThousandSeparators = String(value).replace(/[.,](?=\d{3})/g, '');
  
  // Replace comma decimal separator with a period
  const normalized = cleanedThousandSeparators.replace(',', '.');
  
  const num = parseFloat(normalized);
  return isNaN(num) ? NaN : num;
}

/**
 * Formats a number into a locale-specific string.
 * For simplicity, this example uses a fixed locale, but you might use browser locale.
 * @param value The number to format.
 * @param locale The locale to use for formatting (e.g., 'en-US', 'de-DE'). Defaults to 'en-US'.
 * @returns A formatted string, or an empty string if the value is not a valid number.
 */
export function formatLocaleNumber(value: number | string | undefined | null, locale: string = 'en-US'): string {
  const num = typeof value === 'string' ? parseLocaleNumber(value) : value;
  if (num === null || num === undefined || isNaN(Number(num))) return '';
  
  try {
    return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(num));
  } catch (e) {
    console.error("Error formatting number for locale:", e);
    return String(num); // Fallback to simple string conversion
  }
}
