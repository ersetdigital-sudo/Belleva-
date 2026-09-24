"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { helpArticles, helpTopics } from "@/data/help";
import { cn } from "@/lib/cn";
import type { SiteContacts } from "@/lib/settings";
import type { HelpTopicId } from "@/types";

import { ContactLinks } from "@/components/support/ContactLinks";
import { PlusIcon, SearchIcon } from "@/components/icons";

type TopicFilter = HelpTopicId | "semua";

/**
 * Pusat Bantuan.
 *
 * A search-first help centre: the field filters the whole article set live, the
 * chips narrow it to one topic, and results stay grouped by topic so the shape
 * of the help stays visible while filtering. Answers come from `data/help.ts`.
 *
 * Contact buttons only render when the contacts are set in /admin/kontak — an
 * empty value hides them rather than shipping a button that goes nowhere.
 */
export function HelpCenter({ contacts }: { contacts: SiteContacts }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<TopicFilter>("semua");
  const [openId, setOpenId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const term = query.trim().toLowerCase();

  const matches = useMemo(
    () =>
      helpArticles.filter((article) => {
        if (topic !== "semua" && article.topic !== topic) return false;
        if (!term) return true;
        return `${article.question} ${article.answer}`.toLowerCase().includes(term);
      }),
    [term, topic],
  );

  const groups = helpTopics
    .map((entry) => ({ ...entry, items: matches.filter((a) => a.topic === entry.id) }))
    .filter((entry) => entry.items.length > 0);

  const pill = (selected: boolean) =>
    cn(
      "flex min-h-11 shrink-0 items-center rounded-pill px-4 text-sm font-semibold whitespace-nowrap transition sm:px-5",
      selected
        ? "blue-grad text-white shadow-soft"
        : "card text-muted hover:border-line-2 hover:bg-soft hover:text-brand",
    );

  return (
    <>
      {/* ------------------------------- Hero -------------------------------- */}
      <section className="blue-grad">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center sm:py-20">
          <h1 className="h-display text-3xl font-extrabold text-white sm:text-4xl">
            Pusat Bantuan
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/90">
            Cari panduan seputar transaksi, produk, dan status pesananmu.
          </p>

          <div className="mx-auto mt-7 flex max-w-xl items-center gap-2.5 rounded-2xl bg-white px-4 text-left">
            <SearchIcon className="shrink-0 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari bantuan, misalnya “token listrik”"
              aria-label="Cari bantuan"
              className="w-full min-w-0 bg-transparent py-3.5 text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted"
            />
          </div>
        </div>
      </section>

      {/* ------------------------------ Articles ----------------------------- */}
      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-12">
        <div
          role="group"
          aria-label="Filter topik bantuan"
          className="no-scrollbar flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible"
        >
          <button
            type="button"
            aria-pressed={topic === "semua"}
            onClick={() => setTopic("semua")}
            className={pill(topic === "semua")}
          >
            Semua
          </button>
          {helpTopics.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={topic === entry.id}
              onClick={() => setTopic(entry.id)}
              className={pill(topic === entry.id)}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <p aria-live="polite" className="mt-5 text-xs text-muted">
          {term
            ? `${matches.length} panduan cocok dengan “${query.trim()}”`
            : `${matches.length} panduan`}
        </p>

        {groups.length === 0 ? (
          <div className="card mt-4 p-8 text-center">
            <p className="font-bold">Belum ada panduan yang cocok</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Coba kata lain seperti “pulsa”, “token listrik”, atau “pembayaran”. Kalau yang kamu
              cari soal pesanan tertentu, cek statusnya di halaman Cek Transaksi.
            </p>
            <Link
              href="/cek-transaksi"
              className="blue-grad mt-6 inline-flex min-h-12 items-center rounded-pill px-7 text-sm font-bold text-white"
            >
              Cek Transaksi
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-10">
            {groups.map((group) => (
              <section key={group.id} aria-labelledby={`help-topic-${group.id}`}>
                <h2 id={`help-topic-${group.id}`} className="h-display text-lg font-extrabold">
                  {group.label}
                </h2>
                <p className="mt-1 text-sm text-muted">{group.description}</p>

                <div className="mt-4 space-y-3">
                  {group.items.map((article) => {
                    const isOpen = openId === article.id;
                    const triggerId = `help-trigger-${article.id}`;
                    const panelId = `help-panel-${article.id}`;

                    return (
                      <div key={article.id} className="card overflow-hidden">
                        <h3>
                          <button
                            type="button"
                            id={triggerId}
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            onClick={() => setOpenId(isOpen ? null : article.id)}
                            className="flex w-full items-center gap-4 p-5 text-left font-bold"
                          >
                            <span className="flex-1">{article.question}</span>
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
                              <p className="px-5 pb-5 text-sm text-muted">{article.answer}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* ------------------------------- Closing --------------------------- */}
        <section className="blue-grad mt-12 rounded-hero p-7 text-center sm:p-9">
          <h2 className="h-display text-xl font-extrabold text-white sm:text-2xl">
            Belum ketemu jawabannya?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/90">
            Cek status transaksimu dulu — di situ terlihat pesanannya sudah dikonfirmasi atau
            masih menunggu pembayaran.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/cek-transaksi"
              className="inline-flex min-h-11 items-center rounded-pill bg-white px-6 text-sm font-bold text-brand transition-transform active:scale-[0.98]"
            >
              Cek Transaksi
            </Link>
            <Link
              href="/#faq"
              className="inline-flex min-h-11 items-center rounded-pill border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              Pertanyaan Umum
            </Link>
            <ContactLinks contacts={contacts} />
          </div>
        </section>
      </div>
    </>
  );
}
