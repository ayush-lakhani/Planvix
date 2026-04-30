import { DateTime } from "luxon";

/**
 * safeDate — Production-grade date formatter using Luxon
 * Prevents "Invalid time value" crashes by validating inputs before parsing.
 *
 * @param {any} date - The date value to format
 * @param {string} type - Formatting type ('date', 'datetime', 'detailed', 'time', 'relative', 'monthYear')
 * @returns {string} - Formatted date or fallback em-dash
 */
export const safeDate = (date, type = "date") => {
  if (!date) return "—";

  let parsed;
  try {
    if (date instanceof Date) {
      parsed = DateTime.fromJSDate(date);
    } else if (typeof date === "number") {
      // Assuming JS millis. If it's a python epoch int (seconds), it needs * 1000, but Date() handles millis
      parsed = DateTime.fromMillis(date);
    } else {
      // Could be ISO string, SQL datetime string, etc.
      // JS Date can confidently parse many string formats that Luxon fromISO gets strict about.
      // Let's use JS native Date parsing to fallback effectively
      const nativeDate = new Date(date);
      if (isNaN(nativeDate.getTime())) return "—";
      parsed = DateTime.fromJSDate(nativeDate);
    }
  } catch (error) {
    console.error("[DATE_UTILS] Error parsing date:", error);
    return "—";
  }

  if (!parsed || !parsed.isValid) {
    return "—";
  }

  try {
    switch (type) {
      case "datetime":
        return parsed.toFormat("LLL dd, yyyy HH:mm");
      case "detailed":
        return parsed.toFormat("LLL dd, yyyy • t");
      case "time":
        return parsed.toFormat("tt");
      case "relative":
        return parsed.toRelative();
      case "monthYear":
        return parsed.toFormat("LLLL yyyy");
      case "date":
      default:
        return parsed.toFormat("LLL dd, yyyy");
    }
  } catch (error) {
    console.error("[DATE_UTILS] Error formatting date:", error);
    return "—";
  }
};
