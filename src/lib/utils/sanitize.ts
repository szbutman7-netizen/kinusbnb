/**
 * Input sanitization & security helpers
 */

export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function sanitizeForSheet(value: unknown): string {
  if (value === null || value === undefined) return "";
  let str = String(value).trim();
  // Strip dangerous Excel/Sheets formula prefixes (=, +, -, @, \t, \r)
  if (/^[=+@\-\t\r]/.test(str)) {
    str = "'" + str;
  }
  return str;
}

export function normalizeEmail(email: string): string {
  return (email || "").trim().toLowerCase();
}

export function normalizePhone(phone: string): string {
  const cleaned = (phone || "").trim().replace(/[^\d+]/g, "");
  if (/^0[5]\d{8}$/.test(cleaned)) {
    return "+972" + cleaned.substring(1);
  }
  return cleaned;
}
