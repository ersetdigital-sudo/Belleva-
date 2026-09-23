import type { Bill, ChoiceOption, ProductGroup, Vendor } from "@/types";

/**
 * Demo "Cek Tagihan" inquiry for postpaid products (PLN pascabayar, PDAM,
 * BPJS, internet, angsuran).
 *
 * Marketplace behaviour: the customer enters their number, the app asks the
 * biller for the outstanding bill and shows name + period + amount + penalty
 * before any payment happens. Here the answer is derived deterministically
 * from the customer number, so the product page and the payment page always
 * agree on the amount and re-running it never changes the bill.
 *
 * TODO(content): replace with a real inquiry call to the payment gateway.
 */

const CUSTOMER_NAMES = [
  "SITI RAHAYU",
  "BUDI SANTOSO",
  "ANDI WIJAYA",
  "DEWI LESTARI",
  "AGUS SETIAWAN",
  "RINA MAHARANI",
  "HENDRA GUNAWAN",
  "MAYA SARI",
  "RIDWAN KAMIL",
  "NUR AINI",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function hashCode(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

/** "Okt 2026" for the current month. */
function currentPeriod(): string {
  const now = new Date();
  return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

/** Rounds to the nearest thousand so the bill looks like a real one. */
function roundBill(value: number): number {
  return Math.round(value / 1000) * 1000;
}

export function inquireBill(
  group: ProductGroup,
  vendor: Vendor | undefined,
  customer: string,
  choice: ChoiceOption | undefined,
): Bill {
  const seed = hashCode(`${group.id}|${vendor?.id ?? "-"}|${customer}|${choice?.id ?? "-"}`);
  const months = choice?.multiplier ?? 1;
  const base = roundBill((vendor?.baseAmount ?? 100000) * months);
  const penalty = seed % 5 === 0 ? 5000 : 0;
  const adminFee = group.adminFee ?? 2500;

  const extras: { label: string; value: string }[] = [];
  if (group.id === "pln-bill") {
    extras.push({ label: "Daya", value: `${[900, 1300, 2200, 3500][seed % 4]} VA` });
    extras.push({ label: "Tarif", value: `R-${(seed % 3) + 1}` });
  }
  if (choice) {
    extras.push({ label: "Jumlah bulan", value: `${months} bulan` });
    extras.push({ label: "Iuran per bulan", value: String(base / months) });
  }
  if (group.id === "multifinance") {
    extras.push({ label: "Angsuran ke", value: `${(seed % 24) + 2} dari 36` });
  }

  return {
    customerName: CUSTOMER_NAMES[seed % CUSTOMER_NAMES.length],
    period: currentPeriod(),
    base,
    penalty,
    adminFee,
    total: base + penalty + adminFee,
    extras,
  };
}

/**
 * The 20-digit stroom code printed on the prepaid meter after buying a PLN
 * token. Deterministic per order so the receipt can be re-opened.
 */
export function makeStroomCode(seed: string): string {
  let code = "";
  for (let index = 0; index < 20; index += 1) {
    code += String(hashCode(`${seed}|${index}`) % 10);
  }
  return code;
}

/** Groups a code in blocks of four: "1234 5678 9012 3456 7890". */
export function groupStroomCode(code: string): string {
  return code.replace(/(.{4})/g, "$1 ").trim();
}

/** Prepaid meter lookup: what marketplaces show once the customer id is valid. */
export interface MeterInfo {
  name: string;
  tariff: string;
  power: string;
}

/**
 * Demo meter validation for PLN prabayar. A real integration asks PLN for the
 * customer record before the nominal can be bought.
 * TODO(content): replace with the real PLN inquiry.
 */
export function validateMeter(customer: string): MeterInfo {
  const seed = hashCode(`meter|${customer}`);
  return {
    name: CUSTOMER_NAMES[seed % CUSTOMER_NAMES.length],
    tariff: `R-${(seed % 3) + 1}`,
    power: `${[450, 900, 1300, 2200][seed % 4]} VA`,
  };
}
