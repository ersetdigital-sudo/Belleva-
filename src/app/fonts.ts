import localFont from "next/font/local";

/**
 * Plus Jakarta Sans is self-hosted from /public/fonts via next/font/local, so
 * there is no render-blocking Google Fonts <link> and no layout shift.
 * Only the weights the design actually uses are loaded (400-800, upright).
 */
export const plusJakartaSans = localFont({
  src: [
    { path: "../../public/fonts/plusjakartasans-regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/plusjakartasans-medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/plusjakartasans-semibold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/plusjakartasans-bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/plusjakartasans-extrabold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-plus-jakarta",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});
