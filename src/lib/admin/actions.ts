"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { destroyImage, createUploadSignature } from "./cloudinary";
import { ORDER_STATUSES } from "@/lib/orders";
import { defaultPrices, type CatalogueOverrides, type PriceOverrides } from "@/lib/products";
import type { ProductItem } from "@/types";
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
 * Saves the whole catalogue edit: prices, items added by hand, and shipped items
 * removed.
 *
 * Only prices that differ from the shipped defaults are stored, so a price
 * changed back in code still reaches the site. Added items are shape-checked and
 * capped — the checkout charges whatever lands here, so nothing empty or
 * negative gets through.
 */
export async function saveCatalogueAction(
  overrides: CatalogueOverrides,
): Promise<{ ok: boolean; message?: string; changed?: number; added?: number; hidden?: number }> {
  await requireAdmin();

  try {
    const supabase = createAdminClient();
    const defaults = defaultPrices();
    const prices: PriceOverrides = {};

    for (const [key, value] of Object.entries(overrides.prices ?? {})) {
      if (typeof value !== "number" || !Number.isFinite(value)) continue;
      const price = Math.round(value);
      if (price <= 0) return { ok: false, message: "Harga harus lebih dari 0." };
      if (price !== defaults[key]) prices[key] = price;
    }

    const addedItems: Record<string, ProductItem[]> = {};
    for (const [bucket, items] of Object.entries(overrides.addedItems ?? {})) {
      const clean = (items ?? [])
        .filter((item) => item?.id && item.name?.trim() && Number.isFinite(item.price) && item.price > 0)
        .slice(0, 60)
        .map((item) => ({
          id: String(item.id).slice(0, 40),
          name: item.name.trim().slice(0, 60),
          headline: item.headline?.trim().slice(0, 30) || undefined,
          meta: item.meta?.trim().slice(0, 60) || undefined,
          badge: item.badge?.trim().slice(0, 24) || undefined,
          price: Math.round(item.price),
        }));
      if (clean.length) addedItems[bucket] = clean;
    }

    const hiddenItems = (overrides.hiddenItems ?? [])
      .filter((key) => typeof key === "string" && key.length < 120)
      .slice(0, 500);

    const { error } = await supabase
      .from("site_content")
      .upsert(
        { key: "product_catalogue", data: { prices, addedItems, hiddenItems } },
        { onConflict: "key" },
      );
    if (error) return { ok: false, message: error.message };

    revalidatePath("/", "layout");
    revalidatePath("/admin/produk");
    return {
      ok: true,
      changed: Object.keys(prices).length,
      added: Object.values(addedItems).flat().length,
      hidden: hiddenItems.length,
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Gagal menyimpan." };
  }
}

/**
 * Moves one order to a new status.
 *
 * Called from a client component so the panel can report the outcome, which is
 * why it returns a result instead of being a plain form action.
 */
export async function updateOrderStatusAction(
  id: string,
  status: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();

  if (!id || !ORDER_STATUSES.some((entry) => entry.value === status)) {
    return { ok: false, message: "Status tidak dikenali." };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return { ok: false, message: error.message };

    revalidatePath("/admin/pesanan");
    revalidatePath("/admin");
    return { ok: true };
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
