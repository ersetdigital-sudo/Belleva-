"use client";

import { cn } from "@/lib/cn";

/** "1.234.567" -> 1234567. Non-digits are ignored, so typing dots is safe. */
export function parseRupiah(value: string): number {
  return Number(String(value).replace(/\D/g, "")) || 0;
}

/**
 * 1234567 -> "1.234.567".
 *
 * Hand-rolled rather than `toLocaleString("id-ID")`: ICU data can differ between
 * the Node build used for SSR and the visitor's browser, which would cause a
 * hydration mismatch. This is deterministic everywhere.
 */
export function formatThousands(value: number | string): string {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

interface RupiahInputProps {
  /** Raw number — the dots are presentation only, never stored. */
  value: number;
  onChange: (value: number) => void;
  /** Shown to assistive tech and as the accessible name of the field. */
  label: string;
  className?: string;
  placeholder?: string;
}

/**
 * Money field that groups thousands while typing, so a price reads as
 * Rp 1.234.567 instead of 1234567. Used by every money input in the admin.
 */
export function RupiahInput({ value, onChange, label, className, placeholder }: RupiahInputProps) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 transition focus-within:border-brand",
        className,
      )}
    >
      <span aria-hidden="true" className="text-xs font-semibold text-muted">
        Rp
      </span>
      <input
        value={formatThousands(value)}
        onChange={(event) => onChange(parseRupiah(event.target.value))}
        placeholder={placeholder}
        inputMode="numeric"
        aria-label={label}
        className="w-full min-w-0 bg-transparent py-2.5 text-right text-sm font-bold text-ink outline-none placeholder:font-normal placeholder:text-muted"
      />
    </span>
  );
}
