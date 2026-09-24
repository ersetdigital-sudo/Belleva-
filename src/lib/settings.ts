import { paymentMethods as designDefaults } from "@/data/payment-methods";
import { createReadClient } from "@/lib/admin/supabase";
import { externalLinks } from "@/lib/site";
import type { PaymentMethod } from "@/types";

/**
 * Site settings: database overrides on top of the defaults in `src/data/*`.
 *
 * Rows are only written when an admin actually changes something, so a missing
 * row (or an unreachable database) simply falls back to the shipped default and
 * the site keeps working. Nothing here ever throws for that reason.
 */

/* ------------------------------ Payment -------------------------------- */

export interface PaymentChannelSetting {
  slug: string;
  label: string;
  accountNo?: string;
  accountName?: string;
  codePrefix?: string;
  codeLength?: number;
}

export interface PaymentMethodSetting {
  slug: string;
  name: string;
  description: string;
  instructions: string[];
  qrUrl?: string;
  qrPublicId?: string;
  channels: PaymentChannelSetting[];
}

export const defaultPaymentSettings: PaymentMethodSetting[] = designDefaults.map((method) => ({
  slug: method.id,
  name: method.name,
  description: method.description,
  instructions: method.instructions,
  channels: (method.channels ?? []).map((channel) => ({
    slug: channel.id,
    label: channel.label,
    accountNo: channel.account?.number,
    accountName: channel.account?.holder,
    codePrefix: channel.codePrefix,
    codeLength: channel.codeLength,
  })),
}));

interface MethodRow {
  slug: string;
  name: string;
  description: string;
  instructions: unknown;
  qr_url: string | null;
  qr_public_id: string | null;
}
interface ChannelRow {
  method_id: string;
  slug: string;
  label: string;
  account_no: string | null;
  account_name: string | null;
  code_prefix: string | null;
  code_length: number | null;
}

export async function getPaymentSettings(): Promise<PaymentMethodSetting[]> {
  try {
    const supabase = createReadClient();
    const [methods, channels] = await Promise.all([
      supabase
        .from("payment_methods")
        .select("id, slug, name, description, instructions, qr_url, qr_public_id"),
      supabase
        .from("payment_channels")
        .select("method_id, slug, label, account_no, account_name, code_prefix, code_length")
        .order("sort_order"),
    ]);
    if (methods.error || channels.error || !methods.data) return defaultPaymentSettings;

    const methodRows = methods.data as (MethodRow & { id: string })[];
    const channelRows = (channels.data ?? []) as ChannelRow[];

    const merged = defaultPaymentSettings.map((fallback) => {
      const row = methodRows.find((entry) => entry.slug === fallback.slug);
      if (!row) return fallback;

      const own = channelRows.filter((entry) => entry.method_id === row.id);
      return {
        ...fallback,
        name: row.name,
        description: row.description,
        instructions: Array.isArray(row.instructions)
          ? (row.instructions as string[])
          : fallback.instructions,
        qrUrl: row.qr_url ?? undefined,
        qrPublicId: row.qr_public_id ?? undefined,
        channels: own.length
          ? own.map((entry) => ({
              slug: entry.slug,
              label: entry.label,
              accountNo: entry.account_no ?? undefined,
              accountName: entry.account_name ?? undefined,
              codePrefix: entry.code_prefix ?? undefined,
              codeLength: entry.code_length ?? undefined,
            }))
          : fallback.channels,
      };
    });

    // Methods that exist only in the database.
    const extras = methodRows
      .filter((row) => !defaultPaymentSettings.some((entry) => entry.slug === row.slug))
      .map((row) => ({
        slug: row.slug,
        name: row.name,
        description: row.description,
        instructions: Array.isArray(row.instructions) ? (row.instructions as string[]) : [],
        qrUrl: row.qr_url ?? undefined,
        qrPublicId: row.qr_public_id ?? undefined,
        channels: channelRows
          .filter((entry) => entry.method_id === row.id)
          .map((entry) => ({
            slug: entry.slug,
            label: entry.label,
            accountNo: entry.account_no ?? undefined,
            accountName: entry.account_name ?? undefined,
            codePrefix: entry.code_prefix ?? undefined,
            codeLength: entry.code_length ?? undefined,
          })),
      }));

    return [...merged, ...extras];
  } catch {
    return defaultPaymentSettings;
  }
}

/**
 * Turns the settings back into the shape the checkout renders. Icon, tint and
 * stroke stay in code because they are design tokens, not content.
 */
export function toPaymentMethods(settings: PaymentMethodSetting[]): PaymentMethod[] {
  return settings.map((setting) => {
    const design = designDefaults.find((entry) => entry.id === setting.slug);
    return {
      id: (design?.id ?? setting.slug) as PaymentMethod["id"],
      name: setting.name,
      description: setting.description,
      icon: design?.icon ?? "balance",
      tintClass: design?.tintClass ?? "bg-soft",
      stroke: design?.stroke ?? "#1668f5",
      instructions: setting.instructions,
      qrUrl: setting.qrUrl,
      channels: setting.channels.length
        ? setting.channels.map((channel) => ({
            id: channel.slug,
            label: channel.label,
            account:
              channel.accountNo && channel.accountName
                ? { number: channel.accountNo, holder: channel.accountName }
                : undefined,
            codePrefix: channel.codePrefix,
            codeLength: channel.codeLength,
          }))
        : undefined,
    };
  });
}

/* ------------------------------- Contacts ------------------------------- */

export interface SiteContacts {
  whatsapp: string;
  email: string;
  contact: string;
  helpCenter: string;
  terms: string;
  privacy: string;
  allProducts: string;
}

export const defaultContacts: SiteContacts = {
  whatsapp: externalLinks.whatsapp,
  email: externalLinks.email,
  contact: externalLinks.contact,
  helpCenter: externalLinks.helpCenter,
  terms: externalLinks.terms,
  privacy: externalLinks.privacy,
  allProducts: externalLinks.allProducts,
};

export async function getContacts(): Promise<SiteContacts> {
  try {
    const supabase = createReadClient();
    const { data } = await supabase
      .from("site_content")
      .select("data")
      .eq("key", "contacts")
      .maybeSingle();
    return { ...defaultContacts, ...((data?.data as Partial<SiteContacts>) ?? {}) };
  } catch {
    return defaultContacts;
  }
}
