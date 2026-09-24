"use client";

import { useRef, useState } from "react";

import { deleteImageAction, getUploadSignatureAction } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

interface ImageUploadFieldProps {
  label: string;
  /** Current image URL, if any. */
  value?: string;
  /** Cloudinary public_id of the current image — needed to delete it. */
  publicId?: string;
  /** Sub-folder under the app's Cloudinary folder, e.g. "qris". */
  subfolder: string;
  onChange: (next: { url?: string; publicId?: string }) => void;
  hint?: string;
}

/**
 * Image field: pick a file, it goes straight from the browser to Cloudinary
 * using a signature our server issues, and the resulting URL + public_id are
 * lifted back into the form. Size and format are checked here for fast
 * feedback, and again by Cloudinary (the allowed formats are part of the
 * signature) so the check cannot be skipped from the client.
 */
export function ImageUploadField({
  label,
  value,
  publicId,
  subfolder,
  onChange,
  hint,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!ALLOWED.includes(file.type)) {
      setError("Format harus JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`Ukuran maksimal 2MB — file ini ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
      return;
    }

    setBusy(true);
    try {
      const sign = await getUploadSignatureAction(subfolder);

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", sign.apiKey);
      body.append("timestamp", String(sign.timestamp));
      body.append("folder", sign.folder);
      body.append("allowed_formats", sign.allowedFormats);
      body.append("signature", sign.signature);

      const response = await fetch(sign.uploadUrl, { method: "POST", body });
      const result = (await response.json()) as {
        secure_url?: string;
        public_id?: string;
        error?: { message: string };
      };

      if (!response.ok || result.error || !result.secure_url) {
        throw new Error(result.error?.message ?? `Upload gagal (${response.status}).`);
      }

      onChange({ url: result.secure_url, publicId: result.public_id });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload gagal.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!publicId) {
      onChange({ url: undefined, publicId: undefined });
      return;
    }
    setBusy(true);
    setError(null);
    const result = await deleteImageAction(publicId);
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? "Gagal menghapus gambar.");
      return;
    }
    onChange({ url: undefined, publicId: undefined });
  }

  return (
    <div>
      <span className="block text-sm font-semibold">{label}</span>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}

      <div className="mt-3 flex flex-wrap items-start gap-4">
        <div className="grid h-32 w-32 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line bg-soft">
          {value ? (
            /* eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL, already optimised via f_auto,q_auto */
            <img
              src={value}
              alt=""
              loading="lazy"
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="px-3 text-center text-xs text-muted">Belum ada gambar</span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED.join(",")}
            className="sr-only"
            id={`upload-${subfolder}`}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={`upload-${subfolder}`}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center rounded-pill px-5 text-sm font-bold transition",
                busy ? "bg-line text-muted" : "blue-grad text-white",
              )}
            >
              {busy ? "Memproses…" : value ? "Ganti gambar" : "Pilih gambar"}
            </label>

            {value && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={busy}
                className="inline-flex min-h-11 items-center rounded-pill border border-line px-5 text-sm font-semibold text-danger transition hover:bg-danger-soft disabled:opacity-60"
              >
                Hapus gambar
              </button>
            )}
          </div>

          <p className="text-xs text-muted">JPG, PNG, atau WebP. Maksimal 2MB.</p>
          {publicId && (
            <p className="truncate text-[11px] text-muted">
              public_id: <span className="font-mono">{publicId}</span>
            </p>
          )}
          {error && <p className="text-xs font-semibold text-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
}
