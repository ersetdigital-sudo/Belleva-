-- Pesanan yang masuk dari checkout.
--
-- Dijalankan ke project Supabase `belleva` (xnarhiplpyyidlwhpxkt).
-- Aman dijalankan ulang.
--
-- PENTING: tabel ini TIDAK punya policy baca publik — dan itu disengaja.
-- Isinya nomor HP/ID pelanggan, jadi kalau bisa dibaca anon, siapa pun yang
-- punya anon key (yang memang ada di bundle frontend) bisa membaca seluruh
-- pesanan orang lain. Aksesnya hanya lewat service role di server: panel
-- admin, dan aksi simpan pesanan saat checkout.

create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  /** BLV… — satu per percobaan bayar, dipakai juga oleh /cek-transaksi. */
  reference    text not null,
  customer     text not null,
  product_name text not null,
  group_label  text not null,
  vendor_label text,
  /** Label metode bayar, mis. "QRIS" atau "Transfer Bank · BCA". */
  method       text not null,
  total        integer not null,
  /** menunggu | berhasil | gagal */
  status       text not null default 'menunggu',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Idempotent: checkout yang di-refresh tidak menambah baris baru.
create unique index if not exists orders_reference_key on public.orders (reference);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_customer_idx on public.orders (customer);

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch
  before update on public.orders
  for each row execute function public.touch_updated_at();

alter table public.orders enable row level security;
