"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";
import { formatThousands, parseRupiah } from "@/lib/format";

/**
 * Shared controls for the admin panel.
 *
 * The panel had four copies of the same input string and four different
 * save-feedback patterns. These are the one version: a label that is always
 * visible (never a placeholder standing in for one), helper text that stays put,
 * an error announced under the field it belongs to, and controls tall enough to
 * tap on a phone.
 */

/* --------------------------------- Shell --------------------------------- */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="h-display text-xl font-extrabold">{title}</h2>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  aside,
  children,
  className,
}: {
  title?: string;
  description?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card p-5", className)}>
      {(title || aside) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 className="font-bold">{title}</h3>}
            {description && <p className="mt-1 text-xs text-muted">{description}</p>}
          </div>
          {aside}
        </div>
      )}
      <div className={cn(title && "mt-4")}>{children}</div>
    </section>
  );
}

/** A single figure with its label — the summary row at the top of a page. */
export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-[11px] font-bold tracking-wider text-muted uppercase">{label}</p>
      <p className="mt-1.5 text-lg font-extrabold text-ink tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

/* -------------------------------- Buttons -------------------------------- */

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "blue-grad text-white shadow-soft",
  secondary: "border border-line bg-white text-ink hover:border-brand hover:text-brand",
  danger: "border border-line bg-white text-danger hover:border-danger hover:bg-danger-soft",
  ghost: "text-muted hover:bg-soft hover:text-brand",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Disables the button and swaps the label, so a slow save cannot be double-fired. */
  loading?: boolean;
  loadingLabel?: string;
}

export function Button({
  variant = "primary",
  loading = false,
  loadingLabel,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-pill px-5 text-sm font-bold transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
        VARIANT[variant],
        className,
      )}
    >
      {loading && (
        <svg
          aria-hidden="true"
          className="h-4 w-4 animate-spin motion-reduce:animate-none"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      {loading ? (loadingLabel ?? children) : children}
    </button>
  );
}

/* ---------------------------------- Fields -------------------------------- */

const CONTROL =
  "w-full min-h-11 rounded-xl border border-line bg-white px-3.5 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-muted focus:border-brand disabled:cursor-not-allowed disabled:bg-soft disabled:text-muted";

function FieldShell({
  label,
  hint,
  error,
  required,
  htmlFor,
  describedBy,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor: string;
  describedBy?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <label htmlFor={htmlFor} className="text-xs font-semibold text-ink">
        {label}
        {required && (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (wajib diisi)</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={describedBy} role="alert" className="mt-1.5 text-xs font-semibold text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={describedBy} className="mt-1.5 text-xs leading-relaxed text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextInput({ label, hint, error, required, className, id, ...props }: TextInputProps) {
  const reactId = useId();
  const fieldId = id ?? reactId;
  const describedBy = hint || error ? `${fieldId}-desc` : undefined;

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={fieldId}
      describedBy={describedBy}
    >
      <input
        {...props}
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(CONTROL, error && "border-danger focus:border-danger", className)}
      />
    </FieldShell>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextArea({ label, hint, error, required, className, id, ...props }: TextAreaProps) {
  const reactId = useId();
  const fieldId = id ?? reactId;
  const describedBy = hint || error ? `${fieldId}-desc` : undefined;

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={fieldId}
      describedBy={describedBy}
    >
      <textarea
        {...props}
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(CONTROL, "py-2.5 leading-relaxed", error && "border-danger focus:border-danger", className)}
      />
    </FieldShell>
  );
}

/**
 * Money field. Groups thousands while typing, so a price reads as Rp 1.234.567
 * instead of 1234567, and hands the caller the plain number — the dots are
 * presentation only and are never stored.
 */
export function RupiahInput({
  label,
  hint,
  error,
  required,
  value,
  onChange,
  className,
  id,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  id?: string;
}) {
  const reactId = useId();
  const fieldId = id ?? reactId;
  const describedBy = hint || error ? `${fieldId}-desc` : undefined;

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={fieldId}
      describedBy={describedBy}
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 transition-colors focus-within:border-brand",
          error && "border-danger",
          className,
        )}
      >
        <span aria-hidden="true" className="text-xs font-bold text-muted">
          Rp
        </span>
        <input
          id={fieldId}
          value={formatThousands(value)}
          onChange={(event) => onChange(parseRupiah(event.target.value))}
          inputMode="numeric"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="min-h-11 w-full min-w-0 bg-transparent text-right text-sm font-bold text-ink tabular-nums outline-none"
        />
      </div>
    </FieldShell>
  );
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function SelectField({
  label,
  hint,
  error,
  required,
  options,
  className,
  id,
  ...props
}: SelectFieldProps) {
  const reactId = useId();
  const fieldId = id ?? reactId;
  const describedBy = hint || error ? `${fieldId}-desc` : undefined;

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={fieldId}
      describedBy={describedBy}
    >
      <select
        {...props}
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(CONTROL, "cursor-pointer", error && "border-danger", className)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/* --------------------------------- Save bar -------------------------------- */
/**
 * The one save affordance on a page. It reports whether there is anything to
 * save, so a disabled button never leaves the reader guessing why.
 */
export function SaveBar({
  dirty,
  onSave,
  onReset,
  busy,
  label = "Simpan perubahan",
}: {
  dirty: boolean;
  onSave: () => void;
  onReset?: () => void;
  busy: boolean;
  label?: string;
}) {
  return (
    <div className="sticky bottom-4 z-30 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/95 p-3.5 backdrop-blur">
      <Button onClick={onSave} loading={busy} loadingLabel="Menyimpan…" disabled={!dirty}>
        {label}
      </Button>
      {onReset && (
        <Button variant="ghost" onClick={onReset} disabled={!dirty || busy}>
          Batalkan perubahan
        </Button>
      )}
      <p aria-live="polite" className="text-xs font-semibold text-muted">
        {busy
          ? "Menyimpan…"
          : dirty
            ? "Ada perubahan yang belum disimpan"
            : "Semua perubahan sudah tersimpan"}
      </p>
    </div>
  );
}
