"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from "@/components/icons";

type ToastTone = "success" | "error" | "info";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  /** A second line, for detail the headline should not carry. */
  description?: string;
  /** A single recovery or follow-up step, e.g. "Urungkan". */
  action?: ToastAction;
}

interface ToastEntry extends ToastOptions {
  id: number;
  tone: ToastTone;
  message: string;
  leaving: boolean;
}

interface ToastApi {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/**
 * How long a toast stays before it dismisses itself.
 *
 * Success and info are readable at a glance and clear after 4.5s. Errors get
 * longer: a failure the reader never saw is worse than a toast that lingers, and
 * every toast also carries a close button so it never traps anyone.
 */
const LIFETIME: Record<ToastTone, number> = { success: 4500, info: 4500, error: 8000 };

/** Exit must be quicker than enter for the dismissal to feel responsive. */
const EXIT_MS = 140;

const TONE_STYLE: Record<ToastTone, string> = {
  success: "border-success/25 bg-success-soft text-success",
  error: "border-danger/25 bg-danger-soft text-danger",
  info: "border-line bg-soft text-brand",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, number>());
  const leaveTimers = useRef(new Map<number, number>());

  const clearTimers = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      clearTimers(id);
      // Mark as leaving first so it animates out, then drop it from the list.
      setToasts((prev) => prev.map((entry) => (entry.id === id ? { ...entry, leaving: true } : entry)));
      const timer = window.setTimeout(() => {
        setToasts((prev) => prev.filter((entry) => entry.id !== id));
        leaveTimers.current.delete(id);
      }, EXIT_MS);
      leaveTimers.current.set(id, timer);
    },
    [clearTimers],
  );

  const push = useCallback(
    (tone: ToastTone, message: string, options?: ToastOptions) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-2), { id, tone, message, ...options, leaving: false }]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), LIFETIME[tone]),
      );
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) window.clearTimeout(timer);
      for (const timer of leaveTimers.current.values()) window.clearTimeout(timer);
    },
    [],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message, options) => push("success", message, options),
      error: (message, options) => push("error", message, options),
      info: (message, options) => push("info", message, options),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/*
        Announced politely: a toast confirms something the reader just did, so it
        must not interrupt them or steal focus. `pointer-events-none` on the
        stack keeps it from blocking the page behind it.
      */}
      <ol
        aria-live="polite"
        aria-label="Notifikasi"
        className="pointer-events-none fixed inset-x-4 top-20 z-[100] flex flex-col items-stretch gap-2.5 sm:inset-x-auto sm:right-6 sm:w-96"
      >
        {toasts.map((entry) => (
          <li
            key={entry.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-lg transition-all duration-200 motion-reduce:transition-none",
              entry.leaving
                ? "translate-y-0 scale-95 opacity-0 duration-150"
                : "translate-y-0 scale-100 opacity-100",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border",
                TONE_STYLE[entry.tone],
              )}
            >
              {entry.tone === "success" ? (
                <CheckIcon stroke="currentColor" strokeWidth={3} />
              ) : entry.tone === "error" ? (
                <AlertIcon size={15} />
              ) : (
                <InfoIcon size={15} />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">{entry.message}</p>
              {entry.description && (
                <p className="mt-1 text-xs leading-relaxed text-muted">{entry.description}</p>
              )}
              {entry.action && (
                <button
                  type="button"
                  onClick={() => {
                    entry.action?.onClick();
                    dismiss(entry.id);
                  }}
                  className="mt-2 inline-flex min-h-9 items-center rounded-pill border border-line px-3.5 text-xs font-bold text-brand transition-colors hover:border-brand hover:bg-soft"
                >
                  {entry.action.label}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => dismiss(entry.id)}
              aria-label="Tutup notifikasi"
              className="-mt-1 -mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-pill text-muted transition-colors hover:bg-soft hover:text-ink"
            >
              <CloseIcon size={13} />
            </button>
          </li>
        ))}
      </ol>
    </ToastContext.Provider>
  );
}

/**
 * Toast API for the admin panel.
 *
 * Returns a no-op API outside a provider rather than throwing, so a component
 * can be rendered in isolation (a test, a preview) without crashing.
 */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  return (
    api ?? {
      success: () => {},
      error: () => {},
      info: () => {},
      dismiss: () => {},
    }
  );
}
