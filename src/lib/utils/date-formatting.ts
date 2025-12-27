/**
 * Formats a date to YYYY-MM-DD string
 * @param date - Date object to format
 * @returns Formatted date string
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date to DD-MM-YYYY for CoinGecko API
 * @param date - Date object to format
 * @returns Formatted date string for CoinGecko
 */
export function formatDateForCoinGecko(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Formats a date for display in the UI
 * @param date - Date object or string to format
 * @returns Formatted date string like "Jan 15, 2024"
 */
export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a date with time for display
 * @param date - Date object or string to format
 * @returns Formatted datetime string like "Jan 15, 2024, 3:45 PM"
 */
export function formatDisplayDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Parses a date string from the database
 * @param dateStr - Date string in various formats
 * @returns Date object
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * Returns the start of day for a given date
 * @param date - Date object
 * @returns Date object at 00:00:00
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Checks if two dates are on the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDateString(date1) === formatDateString(date2);
}
