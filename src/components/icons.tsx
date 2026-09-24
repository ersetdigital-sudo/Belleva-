import type {
  CategoryIconId,
  FeatureIconId,
  HelpIconId,
  PaymentIconId,
  SocialIconId,
} from "@/types";

/**
 * Every SVG from the source HTML lives here so the design keeps its exact
 * artwork. Icons that sit inside an `.ico` wrapper intentionally omit
 * width/height — the `.ico > svg` rule in globals.css sizes them.
 */

/* ------------------------------- Categories ------------------------------ */

const categoryIcons: Record<CategoryIconId, React.ReactNode> = {
  pulsa: (
    <>
      <rect
        x="9"
        y="3"
        width="14"
        height="26"
        rx="4"
        fill="#e5484d"
        fillOpacity=".14"
        stroke="#e5484d"
        strokeWidth="2"
      />
      <path d="M14.5 24.5h3M13 7.5h6" stroke="#e5484d" strokeWidth="2" />
    </>
  ),
  "paket-data": (
    <>
      <path d="M3 11.5a19 19 0 0 1 26 0" strokeWidth="2" opacity=".35" />
      <path d="M7.5 16.5a13 13 0 0 1 17 0" strokeWidth="2" opacity=".6" />
      <path d="M12 21.5a7 7 0 0 1 8 0" strokeWidth="2.2" />
      <circle cx="16" cy="26.5" r="1.8" fill="#1668f5" stroke="none" />
    </>
  ),
  pln: (
    <path
      d="M18.5 3.5 8 17.2h6.6l-1.1 11.3L24 14.8h-6.6l1.1-11.3Z"
      fill="#f5a524"
      fillOpacity=".2"
      stroke="#f5a524"
      strokeWidth="2"
    />
  ),
  pdam: (
    <>
      <path
        d="M16 3.5s9 9.4 9 15.1a9 9 0 0 1-18 0C7 12.9 16 3.5 16 3.5Z"
        fill="#12a5e0"
        fillOpacity=".16"
        stroke="#12a5e0"
        strokeWidth="2"
      />
      <path d="M12.5 18.6a3.6 3.6 0 0 0 3.5 3.6" stroke="#12a5e0" strokeWidth="2" />
    </>
  ),
  bpjs: (
    <>
      <circle
        cx="16"
        cy="10"
        r="4.2"
        fill="#17a45f"
        fillOpacity=".18"
        stroke="#17a45f"
        strokeWidth="2"
      />
      <path
        d="M6.5 27c0-4.7 4.3-8 9.5-8s9.5 3.3 9.5 8"
        fill="#17a45f"
        fillOpacity=".14"
        stroke="#17a45f"
        strokeWidth="2"
      />
    </>
  ),
  internet: (
    <>
      <rect
        x="3.5"
        y="5.5"
        width="25"
        height="16"
        rx="3.5"
        fill="#6b4df6"
        fillOpacity=".14"
        stroke="#6b4df6"
        strokeWidth="2"
      />
      <path d="M11 27h10M16 21.5V27" stroke="#6b4df6" strokeWidth="2" />
    </>
  ),
  "e-money": (
    <>
      <rect
        x="3.5"
        y="7.5"
        width="25"
        height="17"
        rx="4"
        fill="#e5489d"
        fillOpacity=".14"
        stroke="#e5489d"
        strokeWidth="2"
      />
      <path d="M3.5 14h25" stroke="#e5489d" strokeWidth="2" />
      <path d="M20 19.5h4.5" stroke="#e5489d" strokeWidth="2.4" />
    </>
  ),
  multifinance: (
    <>
      <path
        d="M4.5 28h23M6.5 28V13.5L16 6l9.5 7.5V28"
        fill="#1668f5"
        fillOpacity=".12"
        stroke="#1668f5"
        strokeWidth="2"
      />
      <path d="M13 28v-6.5h6V28" stroke="#1668f5" strokeWidth="2" />
    </>
  ),
};

/** `paket-data` is the only category icon that inherits its colour from CSS. */
export function CategoryIcon({ id, className }: { id: CategoryIconId; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke={id === "paket-data" ? "#1668f5" : undefined}
      className={className}
      aria-hidden="true"
    >
      {categoryIcons[id]}
    </svg>
  );
}

/* -------------------------------- Features ------------------------------- */

const featureIcons: Record<FeatureIconId, React.ReactNode> = {
  instant: (
    <path
      d="M18.5 3.5 8 17.2h6.6l-1.1 11.3L24 14.8h-6.6l1.1-11.3Z"
      fill="#1668f5"
      fillOpacity=".18"
      stroke="#1668f5"
      strokeWidth="2"
    />
  ),
  secure: (
    <>
      <path
        d="M16 3.5 27 7.6v8.1c0 6.6-4.5 12.3-11 13.8-6.5-1.5-11-7.2-11-13.8V7.6L16 3.5Z"
        fill="#17a45f"
        fillOpacity=".16"
        stroke="#17a45f"
        strokeWidth="2"
      />
      <path d="M11.5 16.4 15 19.9l6-6.4" stroke="#17a45f" strokeWidth="2.4" />
    </>
  ),
  support: (
    <>
      <path
        d="M6 20v-4a10 10 0 0 1 20 0v4"
        fill="#6b4df6"
        fillOpacity=".14"
        stroke="#6b4df6"
        strokeWidth="2"
      />
      <rect
        x="3.5"
        y="18.5"
        width="5.5"
        height="8"
        rx="2.6"
        fill="#6b4df6"
        fillOpacity=".2"
        stroke="#6b4df6"
        strokeWidth="2"
      />
      <path
        d="M23 18.5h3a2.6 2.6 0 0 1 2.5 2.6v2.8a2.6 2.6 0 0 1-2.5 2.6h-.7a8 8 0 0 1-7 4.1"
        fill="#6b4df6"
        fillOpacity=".2"
        stroke="#6b4df6"
        strokeWidth="2"
      />
    </>
  ),
  promo: (
    <>
      <path d="M22.5 9.5 9.5 22.5" stroke="#f5a524" strokeWidth="2.4" />
      <circle
        cx="11"
        cy="11"
        r="3.2"
        fill="#f5a524"
        fillOpacity=".2"
        stroke="#f5a524"
        strokeWidth="2"
      />
      <circle
        cx="21"
        cy="21"
        r="3.2"
        fill="#f5a524"
        fillOpacity=".2"
        stroke="#f5a524"
        strokeWidth="2"
      />
      <path
        d="M16 3.2v2.4M28.8 16h-2.4M16 28.8v-2.4M5.6 16H3.2"
        stroke="#f5a524"
        strokeWidth="2"
      />
    </>
  ),
};

export function FeatureIcon({ id }: { id: FeatureIconId }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {featureIcons[id]}
    </svg>
  );
}

/* ---------------------------- Payment methods ---------------------------- */

export function PaymentIcon({ id, stroke }: { id: PaymentIconId; stroke: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (id === "qris") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1.6" />
        <rect x="14" y="3" width="7" height="7" rx="1.6" />
        <rect x="3" y="14" width="7" height="7" rx="1.6" />
        <path d="M14 14h3v3h-3z" />
        <path d="M20 14h1M14 20h2M18 20h3v1" />
      </svg>
    );
  }

  if (id === "bank") {
    return (
      <svg {...common}>
        <path d="M3 9.5 12 4l9 5.5" />
        <path d="M5.5 10.5v7M10 10.5v7M14 10.5v7M18.5 10.5v7" />
        <path d="M3 21h18" />
      </svg>
    );
  }

  if (id === "ewallet") {
    return (
      <svg {...common}>
        <path d="M3 7h15a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7Zm0 0 12-3" />
        <circle cx="16.5" cy="13" r="1.4" fill={stroke} stroke="none" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 10h5a2 2 0 0 1 0 4H9" />
    </svg>
  );
}

/* -------------------------------- Socials -------------------------------- */

const socialIcons: Record<SocialIconId, React.ReactNode> = {
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.3 2h2.6c.2 1.6 1.1 3 2.5 3.7.7.4 1.5.6 2.3.6v2.7c-1.7 0-3.3-.5-4.7-1.5v6.3a6.6 6.6 0 1 1-6.6-6.6c.4 0 .7 0 1.1.1v2.8a3.8 3.8 0 1 0 2.7 3.7V2Z" />
    </svg>
  ),
  x: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 3h3.3l-7.2 8.2L21.8 21h-6l-4.3-5.6L6.4 21H3.1l7.5-8.5L2.7 3h6l4 5.3L17.5 3Zm-1.2 16h1.8L7.6 4.8H5.7l10.6 14.2Z" />
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.4 1.5-1.4h1.4V5.1c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V11H8v3h2.5v7h3Z" />
    </svg>
  ),
};

export function SocialIcon({ id }: { id: SocialIconId }) {
  return socialIcons[id];
}

/* ------------------------------ UI / utility ----------------------------- */

export function PulsaProductIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#e5484d"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M11 18h2" />
    </svg>
  );
}

export function QuoteIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="#dbe6fb" aria-hidden="true">
      <path d="M9 7H5a3 3 0 0 0 0 6h1c0 2-.8 3.4-2.5 4.4L5 20c3.3-1.6 5-4.3 5-8V7Zm11 0h-4a3 3 0 0 0 0 6h1c0 2-.8 3.4-2.5 4.4L16 20c3.3-1.6 5-4.3 5-8V7Z" />
    </svg>
  );
}

export function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1L12 2Z" />
    </svg>
  );
}

export function AlertIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 8v5" />
      <path d="M12 16.5h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function InfoIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 11v5" />
      <path d="M12 7.5h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function TrashIcon({ size = 15, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function EyeOffIcon({ size = 15, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.3A9.7 9.7 0 0 1 12 5.2c5 0 9 4.1 9 6.8a7.3 7.3 0 0 1-2.2 3.9" />
      <path d="M6.3 7.6A12 12 0 0 0 3 12c0 2.7 4 6.8 9 6.8a9.6 9.6 0 0 0 4-.9" />
      <path d="M9.9 10.2a3 3 0 0 0 4.1 4.2" />
    </svg>
  );
}

export function UndoIcon({ size = 15, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 9h10a5 5 0 0 1 0 10h-3" />
      <path d="M8 5 4 9l4 4" />
    </svg>
  );
}

export function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/** Rotated 45° by the FAQ accordion to become a close indicator. */
export function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CheckIcon({ size = 11, stroke = "#fff", strokeWidth = 3.5 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h13M12 5.5 18.5 12 12 18.5" />
    </svg>
  );
}

export function ShieldCheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3l7 3v6c0 4.4-3 8.2-7 9-4-.8-7-4.6-7-9V6l7-3Z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </svg>
  );
}

/* --------------------------- Mobile app home ----------------------------- */

/** Shared geometry so every new icon matches the existing stroke vocabulary. */
const APP_ICON = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function SearchIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg {...APP_ICON} width={size} height={size} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.4 16.4 4.1 4.1" />
    </svg>
  );
}

export function HelpIcon({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg {...APP_ICON} width={size} height={size} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.7 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.5 2-2.5 3.4" />
      <circle cx="12" cy="17.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg {...APP_ICON} width={size} height={size} className={className}>
      <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
    </svg>
  );
}

export function HomeIcon({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg {...APP_ICON} width={size} height={size} className={className}>
      <path d="M4 10.6 12 4l8 6.6" />
      <path d="M6.3 9.6V20h11.4V9.6" />
      <path d="M10 20v-5.3h4V20" />
    </svg>
  );
}

export function GridIcon({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg {...APP_ICON} width={size} height={size} className={className}>
      <rect x="3.6" y="3.6" width="7" height="7" rx="2" />
      <rect x="13.4" y="3.6" width="7" height="7" rx="2" />
      <rect x="3.6" y="13.4" width="7" height="7" rx="2" />
      <rect x="13.4" y="13.4" width="7" height="7" rx="2" />
    </svg>
  );
}

export function TagIcon({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg {...APP_ICON} width={size} height={size} className={className}>
      <path d="M3.8 11.3V5.1a1.3 1.3 0 0 1 1.3-1.3h6.2a1.3 1.3 0 0 1 .9.4l7.8 7.8a1.3 1.3 0 0 1 0 1.8l-6.2 6.2a1.3 1.3 0 0 1-1.8 0l-7.8-7.8a1.3 1.3 0 0 1-.4-.9Z" />
      <circle cx="8.1" cy="8.1" r="1.5" />
    </svg>
  );
}

/** The centre "Top Up" action on the mobile tab bar. */
export function BoltIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg {...APP_ICON} width={size} height={size} className={className}>
      <path d="M13.2 2.6 6 13.1h4.9L10.6 21.4l7.3-10.5h-4.9l.2-8.3Z" />
    </svg>
  );
}

/** Receipt — the "Cek Transaksi" tab. */
export function ReceiptIcon({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg {...APP_ICON} width={size} height={size} className={className}>
      <path d="M6.5 4.5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v15.2l-2.7-1.7-2.3 1.7-2.3-1.7-2.7 1.7V4.5Z" />
      <path d="M9 8.6h6M9 12.2h3.6" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg {...APP_ICON} width={size} height={size} className={className}>
      <path d="m5.5 9.5 6.5 6.5 6.5-6.5" />
    </svg>
  );
}

/** Clipboard list — the "Kelola pesanan" section. */
export function ClipboardIcon({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg {...APP_ICON} width={size} height={size} className={className}>
      <rect x="5.5" y="4.6" width="13" height="16.4" rx="2.5" />
      <path d="M9.3 4.6v-.8a1.3 1.3 0 0 1 1.3-1.3h2.8a1.3 1.3 0 0 1 1.3 1.3v.8" />
      <path d="M9.3 11h5.4M9.3 14.6h3.5" />
    </svg>
  );
}

/* --------------------- Support and legal link icons ---------------------- */

export function ChatIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg {...APP_ICON} width={size} height={size} className={className}>
      <path d="M20 11.5c0 3.5-3.6 6.3-8 6.3a9.9 9.9 0 0 1-2.7-.37L4.5 19.5l.9-3.1A6.1 6.1 0 0 1 4 11.5C4 8 7.6 5.2 12 5.2s8 2.8 8 6.3Z" />
    </svg>
  );
}

export function DocIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg {...APP_ICON} width={size} height={size} className={className}>
      <path d="M6.5 3.5h7.6l5.4 5.1v11.9h-13V3.5Z" />
      <path d="M13.8 3.7v5.2h5.4" />
      <path d="M9.2 13.1h5.6M9.2 16.4h3.8" />
    </svg>
  );
}

export function PrivacyShieldIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg {...APP_ICON} width={size} height={size} className={className}>
      <path d="M12 3.2 19 6v5.7c0 4.3-3 8-7 8.9-4-.9-7-4.6-7-8.9V6l7-2.8Z" />
      <circle cx="12" cy="10.2" r="1.4" fill="currentColor" stroke="none" />
      <path d="M12 11.7v3" />
    </svg>
  );
}

/** Picks the icon a support/legal link shows, the same way CategoryIcon does. */
export function HelpLinkIcon({ id, className }: { id: HelpIconId; className?: string }) {
  if (id === "chat") return <ChatIcon className={className} />;
  if (id === "doc") return <DocIcon className={className} />;
  if (id === "shield") return <PrivacyShieldIcon className={className} />;
  return <HelpIcon size={18} className={className} />;
}
