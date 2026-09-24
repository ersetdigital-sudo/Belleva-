"use client";

import { useEffect, useState } from "react";

/**
 * Picks the heading the reader is currently under — for a table of contents.
 *
 * The header's `useActiveSection` takes the *topmost* intersecting section,
 * which is right for landing sections that sit far apart, but on a document
 * where headings sit a few lines apart it lags behind. Here the active heading
 * is simply the last one whose top has passed the reading line.
 *
 * `offset` defaults to 200 because that is where an anchor target actually
 * lands on this site: `scroll-padding-top: 5rem` (80px, set on `html` in
 * globals.css) plus the `scroll-mt-28` on each section (112px) puts a clicked
 * heading 192px down. A line above that would leave the clicked heading
 * unhighlighted and keep the previous one lit.
 */
export function useActiveHeading(ids: readonly string[], offset = 200): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    function update() {
      // At the very bottom the last heading never crosses the reading line —
      // there is nothing left to scroll — so it would stay unhighlighted.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActive(elements[elements.length - 1].id);
        return;
      }

      let current = elements[0].id;
      for (const element of elements) {
        if (element.getBoundingClientRect().top - offset <= 0) current = element.id;
      }
      setActive(current);
    }

    // Deferred so the first read happens after paint rather than as a
    // synchronous set-state inside the effect body.
    const frame = window.requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ids, offset]);

  return active;
}
