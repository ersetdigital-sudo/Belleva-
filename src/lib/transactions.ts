import { digitsOnly } from "@/lib/format";

/**
 * Transaction history, kept in the visitor's own browser.
 *
 * Belleva's checkout is a simulation with no backend, so there is nothing
 * server-side to query. Recording completed orders locally is what makes
 * "Cek Transaksi" honest: it reports exactly the transactions this browser
 * created, and says so instead of inventing a lookup it cannot perform.
 *
 * The store is exposed through `useSyncExternalStore`, so React reads it as an
 * external system rather than copying it into component state on mount.
 */

const STORAGE_KEY = "belleva.transactions.v1";
/** Keep the newest entries only — this is a demo store, not an archive. */
const MAX_ENTRIES = 20;

export type TransactionStatus = "menunggu" | "berhasil";

export interface StoredTransaction {
  /** Belleva reference, e.g. "BLV12345678". Unique per payment attempt. */
  reference: string;
  /** The phone number / customer id the order was placed for. */
  customer: string;
  productName: string;
  groupLabel: string;
  /** Human label of the payment method, e.g. "QRIS" or "Transfer Bank · BCA". */
  method: string;
  total: number;
  status: TransactionStatus;
  /** Epoch ms — set once by the store and preserved across status updates. */
  createdAt: number;
}

/** What a caller supplies; the store owns the timestamp. */
export type TransactionInput = Omit<StoredTransaction, "createdAt">;

function isStoredTransaction(value: unknown): value is StoredTransaction {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Partial<StoredTransaction>;
  return (
    typeof entry.reference === "string" &&
    typeof entry.customer === "string" &&
    typeof entry.total === "number" &&
    (entry.status === "menunggu" || entry.status === "berhasil")
  );
}

/** Everything this browser has recorded, newest first. Never throws. */
function parse(): StoredTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredTransaction).sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    // Private mode, a quota error, or hand-edited JSON — treat as "no history".
    return [];
  }
}

/* ------------------------------- The store ------------------------------- */

const EMPTY: StoredTransaction[] = [];
const listeners = new Set<() => void>();
/** Cached so `getSnapshot` returns a stable reference between writes. */
let snapshot: StoredTransaction[] | null = null;
let storageBound = false;

function notify(): void {
  snapshot = null;
  for (const listener of listeners) listener();
}

/** Another tab writing the same key is the one change we cannot see otherwise. */
function handleStorage(event: StorageEvent): void {
  if (event.key === null || event.key === STORAGE_KEY) notify();
}

export function subscribeTransactions(listener: () => void): () => void {
  if (!storageBound) {
    window.addEventListener("storage", handleStorage);
    storageBound = true;
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getTransactionsSnapshot(): StoredTransaction[] {
  snapshot ??= parse();
  return snapshot;
}

/** The server has no localStorage, so it renders the empty state. */
export function getTransactionsServerSnapshot(): StoredTransaction[] {
  return EMPTY;
}

/**
 * Adds an entry, or updates the status of the one already holding this
 * reference. The original timestamp survives, so an order keeps the moment it
 * was created rather than the moment it was last touched.
 */
export function saveTransaction(entry: TransactionInput): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getTransactionsSnapshot();
    const previous = existing.find((item) => item.reference === entry.reference);
    const next = [
      { ...entry, createdAt: previous ? previous.createdAt : Date.now() },
      ...existing.filter((item) => item.reference !== entry.reference),
    ].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    notify();
  } catch {
    /* storage unavailable — the page falls back to its empty state */
  }
}

/**
 * Collapses every way a visitor might type the same number into one form:
 * "0812…", "812…", "+62 812…" and "62812…" all become "812…". The product form
 * stores numbers with the leading zero already dropped, so without this the
 * obvious thing to type on the lookup page would find nothing.
 */
function normalizeNumber(value: string): string {
  const digits = digitsOnly(value).replace(/^0+/, "");
  return digits.length > 11 && digits.startsWith("62") ? digits.slice(2) : digits;
}

/**
 * Matches on the customer number or the reference code — never both at once.
 * A reference like "BLV00005678" ends in digits that can sit inside an
 * unrelated phone number, so a query containing letters is treated as a
 * reference only.
 */
export function findTransactions(
  query: string,
  entries: StoredTransaction[],
): StoredTransaction[] {
  const term = query.trim();
  if (!term) return entries;

  const isReference = /[a-z]/i.test(term);
  const code = term.toLowerCase();
  const digits = isReference ? "" : normalizeNumber(term);

  return entries.filter((entry) => {
    const byCustomer = digits.length > 0 && normalizeNumber(entry.customer).includes(digits);
    return byCustomer || entry.reference.toLowerCase().includes(code);
  });
}

/** "12 Sep 2026, 10:24" — locale-independent so SSR and the client agree. */
export function formatTransactionDate(timestamp: number): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${hours}:${minutes}`;
}
