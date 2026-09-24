"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

import { categoryGradient } from "@/data/categories";
import { productGroups } from "@/data/products";
import { inquireBill } from "@/lib/billing";
import { findChoice, findProductGroup, findVendor } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { digitsOnly, formatRupiah } from "@/lib/format";
import { detectOperatorId, supportsAutoDetect } from "@/lib/operator";
import { externalLinks } from "@/lib/site";
import type { Bill, ProductItem } from "@/types";

import { ArrowRightIcon, CategoryIcon, CheckIcon } from "@/components/icons";

import { ProductItemCard } from "./ProductItemCard";
import { useProductTab } from "./product-tab-context";

const INQUIRY_MS = 700;

/**
 * Nominal density per card style. Three columns as soon as there is room, so
 * the catalogue stays roughly one screen tall instead of running down the page.
 */
const CATALOGUE_GRID: Record<"row" | "tile" | "money", string> = {
  row: "grid-cols-2 sm:grid-cols-3",
  tile: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  money: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("text-right", strong ? "font-bold text-ink" : "font-semibold")}>{value}</dd>
    </div>
  );
}

/** Numbered field group — the marketplace "1 … 2 …" ordering of the form. */
function Step({
  index,
  label,
  htmlFor,
  children,
}: {
  index: number;
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className="blue-grad grid h-6 w-6 shrink-0 place-items-center rounded-pill text-[11px] font-bold text-white">
          {index}
        </span>
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-sm font-semibold">
            {label}
          </label>
        ) : (
          <span className="text-sm font-semibold">{label}</span>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Marketplace PPOB catalogue.
 *
 * Prepaid (pulsa, paket data, token listrik, e-money): enter the number, the
 * operator is inferred where possible, pick a nominal, buy.
 * Postpaid (tagihan listrik, PDAM, BPJS, internet, angsuran): pick the vendor,
 * enter the customer number, press "Cek Tagihan" to run the inquiry, then pay
 * the bill that comes back.
 */
export function ProductSection() {
  const { activeGroup, setActiveGroup } = useProductTab();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [customer, setCustomer] = useState("");
  const [customerTouched, setCustomerTouched] = useState(false);
  /** A manual vendor pick wins over auto-detection until the number is edited. */
  const [vendorOverride, setVendorOverride] = useState<string | null>(null);
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const [bill, setBill] = useState<Bill | null>(null);
  const [checking, setChecking] = useState(false);
  const inquiryTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (inquiryTimer.current !== null) window.clearTimeout(inquiryTimer.current);
    },
    [],
  );

  const group = findProductGroup(activeGroup) ?? productGroups[0];
  const isPhone = supportsAutoDetect(group.id);
  // Cheap prefix lookup — no memo needed, and it keeps this a plain derivation.
  const detectedVendorId = isPhone ? detectOperatorId(customer) : null;
  const vendors = group.vendors ?? [];
  const vendor = findVendor(group, vendorOverride ?? detectedVendorId);
  const choice = findChoice(group, choiceId);
  const items = vendor?.items ?? group.items ?? [];

  const isCustomerValid =
    customer.length >= group.customer.minLength && customer.length <= group.customer.maxLength;
  const isUnknownNumber = isPhone && customer.length >= 4 && detectedVendorId === null;
  const customerError = customerTouched && customer.length > 0 && !isCustomerValid;
  const useSelectPicker = vendors.length > 6 || vendors.some((entry) => entry.label.length > 22);
  /** Operators carry brand logos; the other vendor lists are names only. */
  const hasVendorLogos = vendors.some((entry) => entry.logo);

  const isPrepaid = group.flow === "prepaid";
  const hasVendorStep = Boolean(group.vendorLabel && vendors.length > 0);
  const gradient = categoryGradient(group.icon);

  function resetInquiry() {
    if (inquiryTimer.current !== null) {
      window.clearTimeout(inquiryTimer.current);
      inquiryTimer.current = null;
    }
    setBill(null);
    setChecking(false);
  }

  function handleGroupChange(id: typeof activeGroup) {
    setActiveGroup(id);
    resetInquiry();
    setVendorOverride(null);
    setChoiceId(null);
  }

  function handleCustomerChange(value: string) {
    // Phone fields carry a fixed "+62", so a leading zero is dropped as typed.
    const next = isPhone ? digitsOnly(value).replace(/^0/, "") : value.trim();
    setCustomer(next.slice(0, group.customer.maxLength));
    setCustomerTouched(true);
    setVendorOverride(null);
    resetInquiry();
  }

  /** Returns the captured number, or null (and flags the field) when invalid. */
  function requireCustomer(): string | null {
    if (isCustomerValid) return customer;
    setCustomerTouched(true);
    document.getElementById("produk-customer")?.focus();
    return null;
  }

  /** Prices never travel in the URL — only the catalogue ids do. */
  function goToPayment(params: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    router.push(`/bayar?${query}`);
  }

  function handleBuy(item: ProductItem) {
    const number = requireCustomer();
    if (!number) return;
    goToPayment({
      group: group.id,
      vendor: vendor?.id ?? "",
      item: item.id,
      customer: number,
    });
  }

  function handleCheckBill() {
    const number = requireCustomer();
    if (!number || checking) return;
    resetInquiry();
    setChecking(true);
    inquiryTimer.current = window.setTimeout(() => {
      setBill(inquireBill(group, vendor, number, choice));
      setChecking(false);
      inquiryTimer.current = null;
    }, INQUIRY_MS);
  }

  function handlePayBill() {
    if (!bill) return;
    goToPayment({
      group: group.id,
      vendor: vendor?.id ?? "",
      customer,
      choice: choice?.id ?? "",
    });
  }

  const pill = (selected: boolean) =>
    cn(
      "flex min-h-11 shrink-0 items-center rounded-pill px-4 text-sm font-semibold whitespace-nowrap transition sm:px-5",
      selected
        ? "blue-grad text-white shadow-soft"
        : "card text-muted hover:border-line-2 hover:bg-soft hover:text-brand",
    );

  return (
    <section id="produk" className="mx-auto max-w-6xl px-5 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-bold tracking-widest text-brand">PILIHAN PRODUK</span>
          <h2 className="h-display mt-2 text-3xl font-extrabold sm:text-4xl">{group.title}</h2>
          <p className="mt-2 max-w-xl text-muted">{group.subtitle}</p>
        </div>
        <a
          href={externalLinks.allProducts}
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-pill border border-line px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-brand transition hover:border-brand hover:bg-soft sm:self-auto"
        >
          Lihat Semua Produk
          <ArrowRightIcon />
        </a>
      </div>

      {/* ------------------------- Catalogue tabs --------------------------- */}
      <div
        role="group"
        aria-label="Pilih jenis produk"
        className="no-scrollbar mt-7 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible"
      >
        {productGroups.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={entry.id === group.id}
            onClick={() => handleGroupChange(entry.id)}
            className={pill(entry.id === group.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "mt-6 grid gap-5 lg:items-start",
          isPrepaid ? "lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]" : "lg:max-w-3xl",
        )}
      >
        <div className="@container card p-5 sm:p-6 lg:sticky lg:top-24">
          {/* ---------------------- Vendor / region picker ------------------ */}
          {group.vendorLabel && vendors.length > 0 && (
            <Step index={1} label={group.vendorLabel}>
              {useSelectPicker ? (
                <select
                  id="produk-vendor"
                  aria-label={group.vendorLabel}
                  value={vendor?.id ?? vendors[0].id}
                  onChange={(event) => {
                    setVendorOverride(event.target.value);
                    resetInquiry();
                  }}
                  className="min-h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm font-semibold text-ink transition focus:border-brand focus:outline-none"
                >
                  {vendors.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              ) : hasVendorLogos ? (
                /*
                 * Logo tiles rather than pills. Several operator marks ship on
                 * their own solid brand background, which cannot sit inside the
                 * filled blue pill the selected state uses — so the tile keeps a
                 * neutral surface and selection is carried by the border, a ring
                 * and the label colour instead.
                 */
                <div
                  role="group"
                  aria-label={`Pilih ${group.vendorLabel}`}
                  className="grid grid-cols-3 gap-2 @md:grid-cols-6"
                >
                  {vendors.map((entry) => {
                    const selected = entry.id === vendor?.id;
                    const isAuto = isPhone && entry.id === detectedVendorId;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        aria-pressed={selected}
                        aria-label={entry.label}
                        onClick={() => {
                          setVendorOverride(entry.id);
                          resetInquiry();
                        }}
                        className={cn(
                          "flex min-h-[86px] flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 transition",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                          selected
                            ? "border-brand bg-soft ring-1 ring-brand"
                            : "border-line bg-white hover:border-line-2 hover:bg-soft",
                        )}
                      >
                        <span className="grid h-11 w-full place-items-center rounded-xl bg-soft">
                          {entry.logo ? (
                            /*
                             * Capped with explicit max-* values, not `h-full`:
                             * a percentage height against a centred grid area
                             * does not bind, so the image fell back to its own
                             * aspect ratio and spilled past the box.
                             */
                            <Image
                              src={entry.logo}
                              alt=""
                              width={192}
                              height={96}
                              className="max-h-9 max-w-full object-contain"
                            />
                          ) : (
                            <span className="text-sm font-extrabold text-muted">
                              {entry.label.slice(0, 1)}
                            </span>
                          )}
                        </span>

                        <span
                          className={cn(
                            "text-center text-[11px] leading-tight font-semibold",
                            selected ? "text-brand" : "text-muted",
                          )}
                        >
                          {entry.label}
                        </span>

                        {isAuto && selected && (
                          <span className="text-[9px] leading-none font-bold tracking-wide text-brand uppercase">
                            auto
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div role="group" aria-label={`Pilih ${group.vendorLabel}`} className="flex flex-wrap gap-2">
                  {vendors.map((entry) => {
                    const selected = entry.id === vendor?.id;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setVendorOverride(entry.id);
                          resetInquiry();
                        }}
                        className={pill(selected)}
                      >
                        {entry.label}
                        {isPhone && entry.id === detectedVendorId && selected && (
                          <span className="ml-2 text-[10px] font-bold tracking-wide uppercase opacity-80">
                            auto
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </Step>
          )}

          {/* ------------------------- Customer number --------------------- */}
          <Step
            index={hasVendorStep ? 2 : 1}
            label={group.customer.label}
            htmlFor="produk-customer"
          >
            <div
              className={cn(
                "flex items-center gap-2 rounded-2xl border px-4 transition focus-within:border-brand",
                customerError ? "border-danger" : "border-line",
              )}
            >
              {isPhone && (
                <>
                  <span className="text-sm font-semibold text-muted">+62</span>
                  <span className="h-6 w-px bg-line" />
                </>
              )}
              <input
                id="produk-customer"
                inputMode={isPhone ? "numeric" : "text"}
                autoComplete="off"
                placeholder={group.customer.placeholder}
                value={customer}
                onChange={(event) => handleCustomerChange(event.target.value)}
                onBlur={() => setCustomerTouched(true)}
                aria-invalid={customerError}
                aria-describedby="produk-customer-status"
                className="w-full py-3.5 text-sm font-semibold tracking-wide outline-none"
              />
            </div>

            <p id="produk-customer-status" className="mt-2 min-h-4 text-xs">
              {customerError ? (
                <span className="font-semibold text-danger">
                  {group.customer.label} minimal {group.customer.minLength} digit.
                </span>
              ) : isPhone && detectedVendorId ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                  <CheckIcon size={12} stroke="#17a45f" strokeWidth={3} />
                  {findVendor(group, detectedVendorId)?.label} terdeteksi
                </span>
              ) : isUnknownNumber ? (
                <span className="font-semibold text-danger">
                  Nomor belum dikenali — pilih operator secara manual di atas.
                </span>
              ) : (
                <span className="text-muted">{group.customer.hint}</span>
              )}
            </p>
          </Step>

          {/* --------------------------- BPJS months ----------------------- */}
          {group.choice && (
            <div className="mb-5">
              <p className="mb-2.5 text-sm font-semibold">{group.choice.label}</p>
              <div role="group" aria-label={group.choice.label} className="flex flex-wrap gap-2">
                {group.choice.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={option.id === choice?.id}
                    onClick={() => {
                      setChoiceId(option.id);
                      resetInquiry();
                    }}
                    className={pill(option.id === choice?.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* --------------------- Postpaid: cek tagihan -------------------- */}
          {!isPrepaid && (
            <>
              <button
                type="button"
                onClick={handleCheckBill}
                disabled={checking}
                className="blue-grad grid min-h-12 w-full place-items-center rounded-pill font-bold text-white shadow-soft disabled:opacity-70"
              >
                {checking ? "Mengecek tagihan…" : "Cek Tagihan"}
              </button>

              {bill && (
                <div className="mt-5 rounded-2xl bg-soft p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold">Hasil Cek Tagihan</p>
                    <span className="rounded-pill bg-success-soft px-3 py-1 text-[11px] font-bold text-success">
                      Tagihan ditemukan
                    </span>
                  </div>
                  <dl className="mt-3 space-y-2 text-sm">
                    <Row label="Nama pelanggan" value={bill.customerName} strong />
                    <Row label="Periode" value={bill.period} />
                    {bill.extras.map((extra) => (
                      <Row key={extra.label} label={extra.label} value={extra.value} />
                    ))}
                    <Row label="Tagihan" value={formatRupiah(bill.base)} />
                    {bill.penalty > 0 && <Row label="Denda" value={formatRupiah(bill.penalty)} />}
                    <Row label="Biaya admin" value={formatRupiah(bill.adminFee)} />
                    <div className="flex items-center justify-between gap-4 border-t border-line-2 pt-2">
                      <dt className="font-semibold">Total Tagihan</dt>
                      <dd className="text-base font-extrabold text-brand">
                        {formatRupiah(bill.total)}
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    onClick={handlePayBill}
                    className="blue-grad mt-4 grid min-h-12 w-full place-items-center rounded-pill font-bold text-white shadow-soft"
                  >
                    Bayar Tagihan
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* -------------------------- Nominal catalogue -------------------- */}
        {isPrepaid && (
          <div className="rounded-card border border-line bg-soft p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <span
                className="ico h-11 w-11 shrink-0 rounded-2xl"
                style={{ background: gradient }}
                aria-hidden="true"
              >
                <CategoryIcon id={group.icon} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold">Pilih nominal</p>
                <p className="text-xs text-muted">
                  {vendor ? `${vendor.label} · ` : ""}
                  {items.length} pilihan
                </p>
              </div>
            </div>

            <motion.ul
              key={`${group.id}-${vendor?.id ?? "all"}`}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={cn("grid gap-3 sm:gap-4", CATALOGUE_GRID[group.card])}
            >
              {items.map((item) => (
                <ProductItemCard key={item.id} item={item} style={group.card} onBuy={() => handleBuy(item)} />
              ))}
            </motion.ul>
          </div>
        )}
      </div>
    </section>
  );
}
