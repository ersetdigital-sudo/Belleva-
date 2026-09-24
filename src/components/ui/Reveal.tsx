"use client";

import { motion, useReducedMotion } from "motion/react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait before starting — handy for staggering cards. */
  delay?: number;
  /** Distance travelled on entry, in pixels. */
  y?: number;
}

/**
 * Scroll-reveal wrapper. Slides the element into place once when it enters the
 * viewport, and collapses to a no-op when the visitor prefers reduced motion.
 *
 * Only `y` is animated — never `opacity`. Content that starts transparent only
 * becomes visible if something actually scrolls it into view, so anything that
 * renders the page without that scroll (full-page captures, print, preview
 * thumbnails, jumping in via an anchor link) shows the section as a blank gap.
 * The Keunggulan section is the worst case: on a phone its four cards stack to
 * ~850px, so hidden cards read as one enormous empty band. Sliding from an
 * already-visible default keeps the entrance without ever hiding the content.
 */
export function Reveal({ children, className, delay = 0, y = 18 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ y }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
