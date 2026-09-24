import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { loginAction } from "@/lib/admin/actions";
import { isSignedIn } from "@/lib/admin/session";

export const metadata: Metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await isSignedIn()) redirect("/admin");

  const params = await searchParams;
  const failed = params.error === "1";

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-5 py-16">
      <h1 className="h-display text-2xl font-extrabold">Masuk ke panel admin</h1>
      <p className="mt-1.5 text-sm text-muted">Masukkan password admin untuk melanjutkan.</p>

      <form action={loginAction} className="mt-7">
        <label htmlFor="password" className="block text-sm font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-2xl border border-line px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-brand"
        />

        {failed && (
          <p role="alert" className="mt-3 text-sm font-semibold text-danger">
            Password salah. Coba lagi.
          </p>
        )}

        <button
          type="submit"
          className="blue-grad mt-5 grid min-h-12 w-full place-items-center rounded-pill font-bold text-white shadow-soft"
        >
          Masuk
        </button>
      </form>

      <p className="mt-6 text-xs text-muted">
        Halaman ini tidak terindeks mesin pencari. Sesi berlaku 12 jam.
      </p>
    </div>
  );
}
