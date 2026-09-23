"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { faqItems } from "@/data/faq";

import { PlusIcon } from "@/components/icons";

/**
 * Single-open accordion. Replaces the original <details>/<summary> markup with
 * a real button + panel so the open/close state animates and is announced.
 */
export function Faq() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0]?.id ?? null);
  const reduceMotion = useReducedMotion();

  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
      <h2 className="h-display text-center text-3xl font-extrabold sm:text-4xl">
        Pertanyaan Umum
      </h2>

      <div className="mt-8 space-y-3">
        {faqItems.map((item) => {
          const isOpen = openId === item.id;
          const panelId = `faq-panel-${item.id}`;
          const triggerId = `faq-trigger-${item.id}`;

          return (
            <div key={item.id} className="card overflow-hidden">
              <h3>
                <button
                  type="button"
                  id={triggerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="flex w-full items-center gap-4 p-5 text-left font-bold"
                >
                  <span className="flex-1">{item.question}</span>
                  <motion.span
                    aria-hidden="true"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.2 }}
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-pill bg-soft text-brand"
                  >
                    <PlusIcon />
                  </motion.span>
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-muted">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
