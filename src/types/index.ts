/** Shared domain types for the Belleva landing page. */

export type CategoryIconId =
  | "pulsa"
  | "paket-data"
  | "pln"
  | "pdam"
  | "bpjs"
  | "internet"
  | "e-money"
  | "multifinance";

/**
 * Every transactable catalogue. Grouped the way marketplace PPOB apps do it:
 * prepaid goods you top up with a nominal, and postpaid bills you look up first.
 */
export type ProductGroupId =
  | "pulsa"
  | "data"
  | "pln-token"
  | "pln-bill"
  | "pdam"
  | "bpjs"
  | "internet"
  | "emoney"
  | "multifinance";

/** Prepaid = pick a nominal then pay. Postpaid = "Cek Tagihan" then pay. */
export type FlowKind = "prepaid" | "postpaid";

export type FeatureIconId = "instant" | "secure" | "support" | "promo";

export type PaymentMethodId = "qris" | "transfer" | "ewallet" | "saldo";

export type PaymentIconId = "qris" | "bank" | "ewallet" | "balance";

export type SocialIconId = "instagram" | "tiktok" | "x" | "facebook";

export interface NavLink {
  label: string;
  href: string;
}

/** Icon shown beside a support/legal link. */
export type HelpIconId = "help" | "chat" | "doc" | "shield";

export interface HelpLink {
  label: string;
  href: string;
  icon: HelpIconId;
}

export interface Category {
  id: CategoryIconId;
  label: string;
  href: string;
  /** Inline CSS gradient — mirrors the original inline styles exactly. */
  gradient: string;
  /** Opens this catalogue tab when the shortcut is clicked. */
  productGroup?: ProductGroupId;
}

/** What the customer has to type: phone, meter id, contract number, … */
export interface CustomerField {
  label: string;
  placeholder: string;
  minLength: number;
  maxLength: number;
  hint: string;
}

/** One purchasable nominal (prepaid) — or a top-up / token amount. */
export interface ProductItem {
  id: string;
  /** Small label above the headline, and the whole label on compact rows. */
  name: string;
  /** Headline figure on tiles, e.g. "12 GB" or "Rp 50.000". */
  headline?: string;
  /** Supporting line, e.g. "Masa aktif 30 hari". */
  meta?: string;
  price: number;
  /** Struck-through list price; omit when there is no discount. */
  originalPrice?: number;
  /** Promotional pill, e.g. "Terlaris" or "Hemat 20%". */
  badge?: string;
}

/**
 * A vendor / operator / region / leasing the customer picks.
 * Prepaid vendors carry their own nominals, postpaid vendors carry the base
 * bill the demo inquiry works from.
 */
export interface Vendor {
  id: string;
  label: string;
  /** Public path to the vendor's logo; falls back to a monogram when absent. */
  logo?: string;
  /** MSISDN prefixes used for operator auto-detection, e.g. "0812". */
  prefixes?: string[];
  items?: ProductItem[];
  baseAmount?: number;
}

/** A quantity picker that scales the bill, e.g. BPJS "jumlah bulan". */
export interface ChoiceOption {
  id: string;
  label: string;
  multiplier: number;
}

export interface ProductGroup {
  id: ProductGroupId;
  /** Which hero shortcut icon this catalogue belongs to. */
  icon: CategoryIconId;
  /** Tab label. */
  label: string;
  title: string;
  subtitle: string;
  flow: FlowKind;
  customer: CustomerField;
  /** Compact rows, rich tiles (paket data), or money tiles (token, e-money). */
  card: "row" | "tile" | "money";
  /** Prepaid PLN: reveal the meter card (nama / tarif / daya) once the id is valid. */
  requiresValidation?: boolean;
  /** Picker above the customer number: "Operator", "Wilayah", "Leasing", … */
  vendorLabel?: string;
  vendors?: Vendor[];
  /** Prepaid catalogue when there is no vendor picker. */
  items?: ProductItem[];
  /** Postpaid period/quantity picker, e.g. BPJS months. */
  choice?: { label: string; options: ChoiceOption[] };
  /** Postpaid admin fee added to the bill. */
  adminFee?: number;
  /** Prepaid PLN: issue the 20-digit stroom code after payment. */
  issueStroomCode?: boolean;
}

/** Result of a postpaid "Cek Tagihan" inquiry. */
export interface Bill {
  customerName: string;
  period: string;
  base: number;
  penalty: number;
  adminFee: number;
  total: number;
  extras: { label: string; value: string }[];
}

export interface Feature {
  id: FeatureIconId;
  title: string;
  description: string;
  gradient: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
  rating: number;
}

export interface Stat {
  id: string;
  value: string;
  label: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/** A selectable channel inside a payment method (a bank or an e-wallet). */
export interface PaymentChannel {
  id: string;
  label: string;
  /** Transfer Bank: the destination account shown to the customer. */
  account?: { number: string; holder: string };
  /** E-Wallet: used when generating the demo payment code. */
  codePrefix?: string;
  codeLength?: number;
}

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  description: string;
  icon: PaymentIconId;
  tintClass: string;
  stroke: string;
  /** Channel choices revealed when the method is selected (bank / e-wallet). */
  channels?: PaymentChannel[];
  /** Step-by-step payment guide; `{channel}` is replaced with the chosen label. */
  instructions: string[];
}

export interface SocialLink {
  id: SocialIconId;
  label: string;
  href: string;
}

export interface StoreLink {
  label: string;
  href: string;
}

/** A slide in the mobile app-home promo carousel. */
export interface MobilePromo {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  /** Inline CSS gradient — same convention as `Category.gradient`. */
  gradient: string;
  href: string;
}

/** Bottom tab-bar slots on the mobile app home. */
export type MobileNavId = "beranda" | "produk" | "promo" | "transaksi";

export interface MobileNavItem {
  id: MobileNavId;
  label: string;
  href: string;
}

/**
 * A catalogue item flattened for the mobile home, carrying the group it came
 * from so a tap can open the right catalogue tab.
 */
export interface MobileProduct {
  key: string;
  groupId: ProductGroupId;
  groupLabel: string;
  icon: CategoryIconId;
  /** Inline CSS gradient from the category it belongs to. */
  gradient: string;
  item: ProductItem;
}

/** Sections the Pusat Bantuan page groups its articles into. */
export type HelpTopicId = "umum" | "pembayaran" | "produk" | "kendala";

export interface HelpTopic {
  id: HelpTopicId;
  label: string;
  description: string;
}

export interface HelpArticle {
  id: string;
  topic: HelpTopicId;
  question: string;
  answer: string;
}

/** One numbered section of a legal document. */
export interface LegalSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  summary: string;
  /** Human-readable "last updated" line, kept as text so it never drifts. */
  updated: string;
  sections: LegalSection[];
}
