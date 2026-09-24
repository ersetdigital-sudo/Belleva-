-- Belleva — skema admin panel.
--
-- Dijalankan sekali ke project Supabase `belleva` (xnarhiplpyyidlwhpxkt).
-- Aman dijalankan ulang: semua pernyataan idempoten.
--
-- Prinsip desainnya: **database menimpa, aplikasi tetap punya default.**
-- Setiap section landing page punya default di `src/data/*`. Baris di
-- `site_content` cuma menyimpan yang sudah diubah lewat admin, dan kalau
-- barisnya tidak ada (atau database sedang tidak bisa dihubungi) situs tetap
-- tampil pakai default itu. Jadi tidak ada migrasi data massal, dan situsnya
-- tidak bisa kosong hanya karena database bermasalah.

-- ---------------------------------------------------------------------------
-- 1. Konten situs: satu baris per section, isinya dokumen JSON section itu.
-- ---------------------------------------------------------------------------
create table if not exists public.site_content (
  key        text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.site_content is
  'Override konten landing page per section. Baris yang tidak ada = pakai default di src/data/*.';

-- ---------------------------------------------------------------------------
-- 2. Metode pembayaran — termasuk gambar QRIS yang di-upload ke Cloudinary.
--    `qr_public_id` disimpan supaya gambar lama bisa dihapus saat diganti.
-- ---------------------------------------------------------------------------
create table if not exists public.payment_methods (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  description  text not null default '',
  icon         text not null default 'qris',
  tint         text not null default 'bg-soft',
  stroke       text not null default '#1668f5',
  instructions jsonb not null default '[]'::jsonb,
  qr_url       text,
  qr_public_id text,
  is_active    boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Channel di dalam satu metode: rekening bank atau kode e-wallet.
-- ---------------------------------------------------------------------------
create table if not exists public.payment_channels (
  id           uuid primary key default gen_random_uuid(),
  method_id    uuid not null references public.payment_methods(id) on delete cascade,
  slug         text not null,
  label        text not null,
  account_no   text,
  account_name text,
  code_prefix  text,
  code_length  integer,
  is_active    boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  unique (method_id, slug)
);

create index if not exists payment_channels_method_idx
  on public.payment_channels (method_id, sort_order);

-- ---------------------------------------------------------------------------
-- 4. updated_at otomatis.
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch
  before update on public.site_content
  for each row execute function public.touch_updated_at();

drop trigger if exists payment_methods_touch on public.payment_methods;
create trigger payment_methods_touch
  before update on public.payment_methods
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 5. RLS: boleh dibaca publik, hanya service_role yang boleh menulis.
--    Situs membacanya dari server; panel admin menulis lewat server action
--    memakai service role key yang tidak pernah sampai ke browser.
-- ---------------------------------------------------------------------------
alter table public.site_content     enable row level security;
alter table public.payment_methods  enable row level security;
alter table public.payment_channels enable row level security;

drop policy if exists "site_content public read" on public.site_content;
create policy "site_content public read"
  on public.site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "payment_methods public read" on public.payment_methods;
create policy "payment_methods public read"
  on public.payment_methods for select
  to anon, authenticated
  using (is_active);

drop policy if exists "payment_channels public read" on public.payment_channels;
create policy "payment_channels public read"
  on public.payment_channels for select
  to anon, authenticated
  using (is_active);
