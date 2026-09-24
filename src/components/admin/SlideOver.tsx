"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { CloseIcon } from "@/components/icons";

/**
 * A panel that slides in from the side on desktop and from the bottom on a
 * phone, for a task that deserves its own space rather than being wedged into
 * the page behind it.
 *
 * Closes on Escape and on a scrim click, moves focus into the panel when it
 * opens, puts it back where it was when it closes, and stops the page behind it
 * from scrolling. The scrim is there to dismiss, not to decorate.
 */
export function SlideOver({
  open,
  onClose,
  title,
  description,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const labelledBy = "slide-over-title";

  /* Mount a frame before animating in, and unmount after animating out. */
  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), 160);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreTo.current?.focus?.();
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Tutup panel"
        onClick={onClose}
        className={cn(
          "absolute inset-0 cursor-default bg-ink/40 backdrop-blur-[2px] transition-opacity duration-200 motion-reduce:transition-none",
          visible ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cn(
          "absolute flex flex-col border-line bg-white shadow-2xl outline-none",
          "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl border-t",
          "sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:border-l sm:border-t-0",
          "transition-transform duration-200 motion-reduce:transition-none",
          visible
            ? "translate-y-0 sm:translate-x-0"
            : "translate-y-full sm:translate-y-0 sm:translate-x-full",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line p-5">
          <div className="min-w-0">
            <h3 id={labelledBy} className="text-base font-extrabold">
              {title}
            </h3>
            {description && <p className="mt-1 text-xs text-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="-mt-1 -mr-1 grid h-10 w-10 shrink-0 place-items-center rounded-pill text-muted transition-colors hover:bg-soft hover:text-ink"
          >
            <CloseIcon size={15} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>

        {footer && <div className="border-t border-line p-5">{footer}</div>}
      </div>
    </div>
  );
}
