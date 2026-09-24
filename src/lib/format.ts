/**
 * Locale-independent Rupiah formatting.
 *
 * `Number.prototype.toLocaleString('id-ID')` relies on ICU data, which can
 * differ between the Node build used for SSR and the visitor's browser and
 * would cause hydration mismatches. This stays deterministic everywhere.
 */
export function formatRupiah(value: number): string {
  return `Rp ${String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

/** Strips everything but digits — mirrors the original `rupiah()` helper. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** "1.234.567" -> 1234567. Non-digits are ignored, so typing the dots is safe. */
export function parseRupiah(value: string): number {
  return Number(digitsOnly(value)) || 0;
}

/**
 * 1234567 -> "1.234.567", for money fields that group digits while being typed.
 *
 * Hand-rolled for the same reason as `formatRupiah`: `toLocaleString` depends on
 * ICU data that can differ between the Node build and the visitor's browser.
 */
export function formatThousands(value: number | string): string {
  const digits = digitsOnly(String(value));
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Collapses the ways one number gets written into a single form: "0812…",
 * "812…", "+62 812…" and "62812…" all become "812…".
 *
 * Checkout stores whatever the customer typed, so both the lookup and the
 * stored value have to be normalized before they can be compared.
 */
export function normalizePhone(value: string): string {
  const digits = digitsOnly(value).replace(/^0+/, "");
  return digits.length > 11 && digits.startsWith("62") ? digits.slice(2) : digits;
}

/** "12 Sep 2026, 10:24" — locale-independent so SSR and the client agree. */
export function formatDateTime(timestamp: number): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${hours}:${minutes}`;
}
