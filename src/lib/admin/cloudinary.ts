import { createHash } from "node:crypto";

/**
 * Cloudinary helpers. The API secret lives here and only here — this module is
 * imported by server routes and server actions, never by a client component.
 *
 * Uploads are signed rather than unsigned: the browser asks our server for a
 * signature, then posts the file straight to Cloudinary. That keeps the secret
 * server-side and stops anyone who reads the bundle from uploading into the
 * account.
 */

export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER ?? "belleva";
export const ALLOWED_FORMATS = "jpg,jpeg,png,webp";
export const MAX_BYTES = 2 * 1024 * 1024;

function credentials() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured.");
  }
  return { cloudName, apiKey, apiSecret };
}

/** Cloudinary signs the alphabetically sorted params, joined with the secret. */
function signature(params: Record<string, string | number>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(toSign + apiSecret).digest("hex");
}

/**
 * Everything the browser needs to upload one image directly to Cloudinary.
 * The folder and the allowed formats are part of the signature, so the client
 * cannot widen them.
 */
export function createUploadSignature(subfolder: string) {
  const { cloudName, apiKey, apiSecret } = credentials();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `${CLOUDINARY_FOLDER}/${subfolder}`;

  const params = { folder, timestamp, allowed_formats: ALLOWED_FORMATS };
  return {
    cloudName,
    apiKey,
    folder,
    timestamp,
    allowedFormats: ALLOWED_FORMATS,
    signature: signature(params, apiSecret),
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  };
}

/**
 * Deletes an asset we uploaded earlier.
 *
 * Refuses any public_id outside our own folder, so a stolen admin session
 * cannot be used to delete unrelated assets in the same Cloudinary account.
 */
export async function destroyImage(publicId: string): Promise<{ ok: boolean; message?: string }> {
  const { cloudName, apiKey, apiSecret } = credentials();

  if (!publicId.startsWith(`${CLOUDINARY_FOLDER}/`)) {
    return { ok: false, message: "public_id berada di luar folder aplikasi ini." };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature: signature({ public_id: publicId, timestamp }, apiSecret),
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body,
  });

  if (!response.ok) return { ok: false, message: `Cloudinary menolak (${response.status}).` };
  const result = (await response.json()) as { result?: string; error?: { message: string } };
  if (result.error) return { ok: false, message: result.error.message };
  return { ok: result.result === "ok" || result.result === "not found" };
}
