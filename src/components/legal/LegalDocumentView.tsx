"use client";

import { useMemo } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { useActiveHeading } from "@/lib/use-active-heading";
import type { SiteContacts } from "@/lib/settings";
import type { LegalDocument } from "@/types";

import { ContactLinks } from "@/components/support/ContactLinks";

/**
 * Renders a legal document: a compact brand header, a contents rail that tracks
 * the reader's position on desktop, and the numbered sections in a readable
 * measure. The rail uses a heading-aware scroll-spy, so on a document whose
 * headings sit close together the highlighted entry is the one being read.
 */
export function LegalDocumentView({
  document,
  contacts,
}: {
  document: LegalDocument;
  contacts: SiteContacts;
}) {
  const ids = useMemo(() => document.sections.map((section) => section.id), [document]);
  const active = useActiveHeading(ids);

  return (
    <>
      <section className="blue-grad">
        <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
          <h1 className="h-display text-3xl font-extrabold text-white sm:text-4xl">
            {document.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/90">{document.summary}</p>
          <p className="mt-4 text-xs font-semibold text-white/90">
            Terakhir diperbarui {document.updated}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:items-start lg:gap-12">
          <nav aria-label="Daftar isi" className="hidden lg:sticky lg:top-24 lg:block">
            <p className="text-xs font-bold tracking-widest text-muted">DAFTAR ISI</p>
            <ul className="mt-3 space-y-0.5 text-sm">
              {document.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={active === section.id ? "true" : undefined}
                    className={cn(
                      "block rounded-xl px-3 py-2 leading-snug transition-colors",
                      active === section.id
                        ? "bg-soft font-semibold text-brand"
                        : "text-muted hover:bg-soft hover:text-brand",
                    )}
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-3xl space-y-10">
            {document.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="h-display text-lg font-extrabold sm:text-xl">{section.heading}</h2>

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-sm leading-relaxed text-muted">
                    {paragraph}
                  </p>
                ))}

                {section.bullets && (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-muted">
                        <span
                          aria-hidden="true"
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <section className="blue-grad rounded-hero p-7 text-center sm:p-9">
              <h2 className="h-display text-xl font-extrabold text-white">
                Ada pertanyaan soal dokumen ini?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/90">
                Panduan transaksi sehari-hari ada di Pusat Bantuan, dan status pesananmu bisa dicek
                langsung.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/pusat-bantuan"
                  className="inline-flex min-h-11 items-center rounded-pill bg-white px-6 text-sm font-bold text-brand transition-transform active:scale-[0.98]"
                >
                  Pusat Bantuan
                </Link>
                <Link
                  href="/cek-transaksi"
                  className="inline-flex min-h-11 items-center rounded-pill border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                >
                  Cek Transaksi
                </Link>
                <ContactLinks contacts={contacts} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
