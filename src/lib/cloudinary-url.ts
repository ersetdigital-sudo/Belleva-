/**
 * Adds Cloudinary's own optimisation to a stored image URL, so a 4000px original
 * is never served into a thumbnail slot. Client-safe on purpose — the checkout
 * is a client component and needs this, while the signing helpers (which hold
 * the API secret) must stay server-side.
 */
export function optimisedUrl(url: string, width = 800): string {
  if (!url.includes("/image/upload/")) return url;
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${width},c_fill/`);
}
