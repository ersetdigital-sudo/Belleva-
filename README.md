# Belleva — Landing Page (Next.js)

Konversi dari HTML statis (`_reference/pages/index.html`) menjadi **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4**, dengan animasi Framer Motion dan metadata SEO lengkap.

## Menjalankan

```bash
npm run dev        # dev server (Turbopack)
npm run build      # production build
npm start          # jalankan hasil build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Struktur

```
public/
  fonts/            # Plus Jakarta Sans (5 weight yang dipakai saja)
  images/           # hero + promo (WebP), logo ter-trim, og image
src/
  app/
    layout.tsx      # shell global: Header + main + Footer
    page.tsx        # landing page
    bayar/          # halaman pembayaran (/bayar) — noindex
    globals.css     # token desain (@theme) + komponen
    fonts.ts, sitemap.ts, robots.ts, icon.png
  components/
    layout/         # Header (scroll-spy + menu mobile), Footer, Logo
    home/           # Hero, CategoryStrip, PromoBanner, ProductSection,
                    # PackageCard (katalog paket data), Features, Steps,
                    # Testimonials, Faq, CtaBanner, product-tab-context
    checkout/       # PaymentFlow (halaman pembayaran)
    ui/             # Reveal (wrapper scroll-animation)
    seo/            # StructuredData (JSON-LD)
    icons.tsx       # semua SVG dari HTML asli
  data/             # konten statis: nav, categories, products, features, steps,
                    # testimonials, faq, payment-methods
  lib/              # site (config + link), catalog (resolve id produk), seo,
                    # structured-data, operator (deteksi prefix), format, cn,
                    # use-active-section
  types/            # tipe domain bersama
_reference/         # HTML + aset asli, hanya untuk perbandingan (tidak ikut di-build)
```

## Alur beli (marketplace PPOB)

Sama untuk tab **Pulsa** dan **Paket Data**, tanpa popup:

1. **Isi nomor HP dulu** di section produk (`+62` sudah termasuk, angka `0` depan otomatis dibuang).
2. **Operator ke-detect sendiri** dari prefix (`0812` → Telkomsel, `0817` → XL, dst); chip operator ikut menyesuaikan dan dikasih label `auto`. Prefix nggak dikenal → user pilih manual.
3. **Katalog operator itu** yang muncul — tab **Pulsa** (list denominasi) atau **Paket Data** (grid kartu: kuota, masa aktif, jaringan, harga coret, badge).
4. Klik **Beli** → pindah ke **halaman pembayaran `/bayar`**. Nomor valid itu syaratnya; kalau belum, field di-focus + error.
5. Di `/bayar`: pilih metode bayar, cek rincian, lalu **Bayar Sekarang** → tampil **instruksi bayar** (bukan langsung sukses):
   - **QRIS** → kode QR, tinggal scan dari aplikasi bank/e-wallet mana pun
   - **Transfer Bank** → no. rekening + atas nama (BCA/BNI/Mandiri/BRI) + tombol salin
   - **E-Wallet** → kode pembayaran (GoPay/OVO/DANA/ShopeePay)
   - **Saldo Belleva** → langsung terpotong, tanpa instruksi
   Ada countdown 24 jam, lalu klik **Saya Sudah Bayar** → status sukses + nomor referensi.

Catatan desain: URL `/bayar` cuma bawa **id produk + nomor**, harga selalu di-resolve dari `src/lib/catalog.ts` — jadi harga nggak bisa dimanipulasi dari query string. Di mobile ada **action bar sticky** berisi total + tombol bayar; di desktop jadi sidebar sticky.

Shortcut ikon di hero ("Pulsa", "Paket Data") langsung ganti tab yang aktif.

## Cara maintain

- **Nambah operator / denominasi / paket data** → edit `src/data/products.ts` (termasuk `operatorPrefixes` buat deteksi).
- **Ganti teks FAQ / fitur / langkah / testimoni** → file di `src/data/`.
- **Ganti metode bayar / channel** → `src/data/payment-methods.ts`.
- **Ganti warna brand, shadow, radius** → token di `@theme` dalam `src/app/globals.css`.
- **Ganti domain** → set env `NEXT_PUBLIC_SITE_URL` (default `https://belleva.net`).

## Yang masih perlu diisi manual

Lihat `src/lib/site.ts` → `externalLinks`. Semua nilai di sana masih `"#"` seperti di HTML asli:

`login`, `signUp` (tujuan tombol "Daftar Sekarang"), `allProducts`, `helpCenter`, `contact`, `terms`, `privacy`, `whatsapp`, `email`.

Selain itu:

- `src/data/products.ts` — **harga & nama paket data masih placeholder** (demo biar alurnya bisa dicoba). Cuma harga pulsa Telkomsel yang dari HTML asli. Daftar prefix operator juga perlu dicek lagi ke daftar resmi operator.
- `src/data/payment-methods.ts` — **nomor rekening bank masih ngasal/demo** (atas nama "PT BELLEVA INDONESIA"), "Sisa saldo Rp 250.000" masih hardcode, dan **payload QRIS masih demo** (bukan QRIS asli dari payment gateway).
- `src/data/testimonials.ts` — baru 1 testimoni (sesuai HTML asli).
- Pembayaran masih simulasi: QR / no. rekening muncul normal, tapi belum ada verifikasi otomatis — status lunas ditandai lewat tombol **Saya Sudah Bayar**. Perlu integrasi payment gateway supaya statusnya real.

## Deploy

Static + ISR friendly. Deploy ke Vercel (atau host Node lain) — tidak ada environment variable wajib.
