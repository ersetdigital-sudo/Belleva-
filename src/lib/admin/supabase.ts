import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client.
 *
 * Server only. This key bypasses RLS, so it must never be imported from a
 * client component. In the browser `SUPABASE_SERVICE_ROLE_KEY` is undefined
 * (only `NEXT_PUBLIC_*` values are inlined), so an accidental import fails
 * loudly here instead of shipping the key.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase admin client: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.",
    );
  }

  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Public read client — the anon key, which RLS lets SELECT the content tables. */
export function createReadClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase read client: NEXT_PUBLIC_SUPABASE_URL and an anon key must be set.");
  }

  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
