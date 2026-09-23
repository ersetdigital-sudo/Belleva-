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
