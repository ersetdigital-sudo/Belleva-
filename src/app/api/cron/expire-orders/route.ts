import { NextResponse } from "next/server";

import { expireStaleOrders } from "@/lib/orders";

/**
 * Daily write-off of unpaid orders, so the promise on the payment page holds
 * even on a day nobody opens the admin panel.
 *
 * The sweep also runs off the read paths, but this is the part that does not
 * depend on traffic. If CRON_SECRET is configured, the caller must present it —
 * set it in Vercel and Vercel Cron will send it automatically.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, message: "Tidak diizinkan." }, { status: 401 });
  }

  const expired = await expireStaleOrders();
  return NextResponse.json({ ok: true, expired });
}
