"use client";

import { useState, useTransition } from "react";

import { updateOrderStatusAction } from "@/lib/admin/actions";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";

import { useToast } from "./Toast";

const TEXT: Record<OrderStatus, string> = {
  menunggu: "Kembali menunggu",
  berhasil: "Tandai berhasil",
  gagal: "Tandai gagal",
};

/**
 * Status actions for one order.
 *
 * Each button disables itself while its own request is in flight, then reports
 * through a toast — a table row has nowhere to put an inline message.
 */
export function OrderStatusButtons({
  id,
  reference,
  status,
}: {
  id: string;
  reference: string;
  status: OrderStatus;
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState<OrderStatus | null>(null);

  function setStatus(next: OrderStatus) {
    setActive(next);
    startTransition(async () => {
      const result = await updateOrderStatusAction(id, next);
      setActive(null);

      if (!result.ok) {
        toast.error("Status gagal diubah", {
          description: result.message ?? `Pesanan ${reference} belum berubah.`,
        });
        return;
      }

      toast.success(`${reference} → ${ORDER_STATUSES.find((e) => e.value === next)?.label}`, {
        description: "Statusnya sudah ikut berubah di halaman Cek Transaksi.",
      });
    });
  }

  return (
    <div className="flex justify-end gap-2">
      {ORDER_STATUSES.filter((entry) => entry.value !== status).map((entry) => (
        <button
          key={entry.value}
          type="button"
          onClick={() => setStatus(entry.value)}
          disabled={pending}
          aria-busy={active === entry.value || undefined}
          className="min-h-9 cursor-pointer rounded-pill border border-line px-3 text-xs font-semibold whitespace-nowrap text-muted transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          {active === entry.value ? "Menyimpan…" : TEXT[entry.value]}
        </button>
      ))}
    </div>
  );
}
