"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { destroyImage, createUploadSignature } from "./cloudinary";
import { defaultPrices, type PriceOverrides } from "@/lib/products";
import {
  SESSION_COOKIE,
  createSessionToken,
  isSignedIn,
  sessionCookieOptions,
  verifyPassword,
} from "./session";
import { createAdminClient } from "./supabase";
import type { PaymentMethodSetting, SiteContacts } from "@/lib/settings";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) redirect("/admin/login?error=1");

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

async function requireAdmin() {
  if (!(await isSignedIn())) redirect("/admin/login");
}

/**
 * Writes the whole payment block: the method rows, and each method's channels
 * (replaced wholesale, since the form always sends the full list).
 *
 * A QR image that was replaced is deleted from Cloudinary afterwards, so
 * swapping the QRIS photo does not leave the old upload behind.
 */
export async function savePaymentSettingsAction(
  settings: PaymentMethodSetting[],
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();

  try {
    const supabase = createAdminClient();

    const { data: before } = await supabase
      .from("payment_methods")
      .select("id, slug, qr_public_id");

    const replaced: string[] = [];

    for (const [index, method] of settings.entries()) {
      const previous = (before ?? []).find((row) => row.slug === method.slug);

      if (previous?.qr_public_id && previous.qr_public_id !== method.qrPublicId) {
        replaced.push(previous.qr_public_id);
      }

      const { data: saved, error } = await supabase
        .from("payment_methods")
        .upsert(
          {
            slug: method.slug,
            name: method.name,
            description: method.description,
            instructions: method.instructions,
            qr_url: method.qrUrl ?? null,
            qr_public_id: method.qrPublicId ?? null,
            is_active: true,
            sort_order: index,
          },
          { onConflict: "slug" },
        )
        .select("id")
        .single();

      if (error || !saved) return { ok: false, message: error?.message ?? "Gagal menyimpan." };

      await supabase.from("payment_channels").delete().eq("method_id", saved.id);

      if (method.channels.length) {
        const { error: channelError } = await supabase.from("payment_channels").insert(
          method.channels.map((channel, channelIndex) => ({
            method_id: saved.id,
            slug: channel.slug,
            label: channel.label,
            account_no: channel.accountNo ?? null,
            account_name: channel.accountName ?? null,
            code_prefix: channel.codePrefix ?? null,
            code_length: channel.codeLength ?? null,
            sort_order: channelIndex,
          })),
        );
        if (channelError) return { ok: false, message: channelError.message };
      }
    }

    // Only after the database accepted the new state.
    for (const publicId of replaced) await destroyImage(publicId);

    revalidatePath("/admin/pembayaran");
    revalidatePath("/bayar");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Gagal menyimpan." };
  }
}

export async function saveContactsAction(
  contacts: SiteContacts,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("site_content")
      .upsert({ key: "contacts", data: contacts }, { onConflict: "key" });
    if (error) return { ok: false, message: error.message };

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Gagal menyimpan." };
  }
}

/**
 * Saves product prices.
 *
 * Only the rows that differ from the shipped defaults are stored, so the record
 * stays small and a price changed back in code still reaches the site. Prices
 * are validated as positive integers — the checkout charges whatever lands here.
 */
export async function saveProductPricesAction(
  prices: PriceOverrides,
): Promise<{ ok: boolean; message?: string; changed?: number }> {
  await requireAdmin();

  try {
    const supabase = createAdminClient();
    const defaults = defaultPrices();
    const changed: PriceOverrides = {};

    for (const [key, value] of Object.entries(prices)) {
      if (typeof value !== "number" || !Number.isFinite(value)) continue;
      const price = Math.round(value);
      if (price <= 0) return { ok: false, message: "Harga harus lebih dari 0." };
      if (price !== defaults[key]) changed[key] = price;
    }

    const { error } = await supabase
      .from("site_content")
      .upsert({ key: "product_prices", data: { prices: changed } }, { onConflict: "key" });
    if (error) return { ok: false, message: error.message };

    revalidatePath("/", "layout");
    revalidatePath("/admin/produk");
    return { ok: true, changed: Object.keys(changed).length };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Gagal menyimpan." };
  }
}

/** Asks Cloudinary for the signature one image upload needs. */
export async function getUploadSignatureAction(subfolder: string) {
  await requireAdmin();
  // The folder is part of the signature, so it has to be sanitised before it is
  // signed — otherwise the client could steer uploads outside our own folder.
  const safe = subfolder.replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "misc";
  return createUploadSignature(safe);
}

export async function deleteImageAction(
  publicId: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  return destroyImage(publicId);
}
