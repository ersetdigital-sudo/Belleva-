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
    cek-transaksi/  # halaman cek transaksi (/cek-transaksi) — noindex
    globals.css     # token desain (@theme) + komponen
    fonts.ts, sitemap.ts, robots.ts, icon.png
  components/
    layout/         # Header (scroll-spy + menu mobile), Footer, Logo
    home/           # Hero, CategoryStrip, PromoBanner, ProductSection,
                    # PackageCard (katalog paket data), Features, Steps,
                    # Testimonials, Faq, CtaBanner, product-tab-context
    home/mobile/    # MobileHome — app home versi HP (app bar, search, promo
                    # rail, rail kategori, baris promo, rekomendasi, bottom nav)
    checkout/       # PaymentFlow (halaman pembayaran)
    ui/             # Reveal (wrapper scroll-animation)
    seo/            # StructuredData (JSON-LD)
    icons.tsx       # semua SVG dari HTML asli
  data/             # konten statis: nav, categories, products, features, steps,
                    # testimonials, faq, payment-methods, mobile-home
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

## Header

Header desktop (dari `lg`): logo di kiri, menu navigasi **rata tengah**, tombol **Bantuan** di kanan.

- Menu-nya di-pin ke tengah (`absolute left-1/2 -translate-x-1/2` + `inset-y-0`), bukan mengalir setelah logo — jadi posisinya tidak bergeser kalau lebar logo atau tombol kanan berubah.
- **Tombol Masuk/Daftar dihapus**, diganti tombol Bantuan. Keempat link bantuan/legal tidak muat kalau ditampilkan sebagai baris di kanan: butuh ~426px, sementara ruang di kanan menu tengah maksimal ~381px karena barnya dibatasi `max-w-6xl`. Jadi dipakai disclosure — klik Bantuan, panel turun berisi keempat link dengan ikonnya. Panel menutup saat klik di luar atau tekan Escape.
- Link-nya dari `helpLinks` (`src/data/nav.ts`), sumber yang sama dengan kolom Bantuan di footer, jadi isinya tidak bisa berbeda.
- Di HP header ini disembunyikan di route `/` (digantikan app bar + bottom nav). Di route lain (`/bayar`, `/cek-transaksi`) header tetap tampil, dan link bantuan/legal-nya bisa diakses dari footer.

## Mobile: app home

Di layar HP, home page bukan landing page lagi — tapi **app home** yang mengikuti
wireframe `hot-pot-restaurant-home`: app bar biru (logo + tombol bantuan, wave
divider) → sapaan + search → **banner hero** → promo rail dengan pagination dots →
grid layanan → baris promo → grid rekomendasi 2 kolom → bottom nav fixed dengan
FAB **Top Up**.

- **Breakpoint-nya `lg` (1024px).** `MobileHome` di-`lg:hidden`, sedangkan Hero +
  PromoBanner di-`hidden lg:block` — jadi cuma satu komposisi yang ter-layout di
  lebar mana pun. Desktop tidak berubah.
- **Header situs disembunyikan di mobile, hanya di route `/`** (`usePathname` di
  `Header.tsx`). `/bayar` dan `/cek-transaksi` tetap pakai header biasa.
- **Banner hero** (`mobile-hero-banner.tsx`) memakai permukaan brand yang sudah ada
  (gradient `.blue-grad`, radius hero, font plus Jakarta Sans) — jadi HP tetap
  menyampaikan hal yang sama dengan hero artwork di desktop. Isinya cuma teks +
  satu CTA, karena belum ada aset ilustrasi untuk mobile.
- **Search-nya hidup** — filternya jalan di `mobileCatalogue`
  (`src/data/mobile-home.ts`), maksimal 8 hasil, plus empty state.
- **Bottom nav:** Beranda · Produk · FAB Top Up · Promo · Transaksi. Tidak ada menu
  Akun. Beranda = scroll ke atas, FAB = set tab Pulsa lalu scroll ke `#produk`.
  Tab aktif ikut scroll-spy, bukan hardcode.
- **Section landing tetap lanjut** di bawah app home (Produk, Keunggulan, Langkah,
  Testimoni, FAQ, CTA, Footer).

Tiga hal di wireframe yang tidak bisa ditiru apa adanya karena asetnya belum ada:

1. **Padding status bar 56px dihapus** — itu untuk status bar iOS, di web jadi pita biru kosong.
2. **Bell notifikasi → tombol bantuan.** Belleva belum punya sistem notifikasi.
3. **Ilustrasi promo & foto produk → gradient + ikon kategori.** Belum ada asetnya,
   dan bikin ilustrasi tiruan lebih buruk daripada tidak ada.
4. **Rail kategori horizontal → grid 4×2.** Rail-nya memotong layanan terakhir di HP;
   grid 4 kolom menampilkan kedelapan layanan utuh tanpa ada yang kepotong.

## Cek Transaksi (/cek-transaksi)

Tab **Transaksi** di bottom nav mobile dan link di footer desktop menuju halaman ini.

Pencariannya jalan **di server**, ke tabel `orders` yang sama dengan yang dikelola di
`/admin/pesanan` — jadi riwayatnya ikut orangnya, bukan ikut browsernya:

- Checkout mencatat pesanannya ke `orders` lewat `recordOrderAction`, dan
  `settleOrderAction` menandainya berhasil saat pelanggan menekan konfirmasi.
  Harga dihitung ulang di server dari katalog, jadi yang tersimpan bukan angka
  kiriman browser.
- `lookupOrders` (`src/lib/orders.ts`) menerima **kode referensi** atau **nomor HP**.
  Kode referensi dibuat per percobaan bayar, jadi memegang kodenya sudah jadi bukti
  pemilik. Nomor HP bukan bukti apa pun, jadi pencarian nomor mensyaratkan nomor
  lengkap (minimal 8 digit) dan dibatasi 10 hasil terbaru.
- Nomor dinormalisasi dulu lewat `normalizePhone`, jadi `0812…`, `812…`, dan
  `+62 812…` menemukan pesanan yang sama — termasuk pesanan yang tersimpan dalam
  format berbeda.
- Wildcard `%` dan `_` dibuang sebelum dipakai. Tanpa itu, `%` sendirian akan
  mencocokkan semua baris dan membocorkan pesanan orang lain.
- Pencariannya dijalankan saat tombol **Cek** ditekan, bukan tiap ketikan, karena
  ini sudah berupa permintaan ke server.
- Tidak ada lagi store `localStorage` — `src/lib/transactions.ts` dihapus, begitu
  juga salinan lokal saat checkout. Cek Transaksi dan panel admin membaca sumber
  yang sama. `formatTransactionDate` dipindah ke `lib/format` sebagai
  `formatDateTime` karena dipakai dua halaman.

Tab-nya berlabel **"Transaksi"**, bukan "Cek Transaksi": lima tab di layar 360px
hanya memberi 68px per tab sementara label panjangnya butuh ~71px, jadi labelnya
turun ke baris kedua dan ikonnya jadi tidak sejajar dengan tab lain.

## Logo operator

Picker operator di section produk menampilkan logo provider, bukan cuma nama.

- Filenya di `public/images/operator/`: `telkomsel.png`, `xl.png`, `indosat.png`, `tri.png`, `smartfren.png`, `axis.png`. Semuanya sudah dipotong margin transparannya dan diseragamkan tingginya (96px), total ~41 KB.
- `logo` di-set per vendor di `operatorVendors` (`src/data/products.ts`). Begitu ada satu vendor yang punya `logo`, picker-nya otomatis berubah dari pill jadi grid kartu logo; vendor tanpa `logo` jatuh ke monogram huruf awal.
- **Kenapa grid, bukan pill:** beberapa logo (Indosat, Axis) membawa background brand-nya sendiri berupa blok warna solid, dan itu tidak bisa ditaruh di dalam pill biru yang dipakai state terpilih. Jadi tile-nya pakai permukaan netral, dan state terpilih ditandai border + ring + warna label.
- **Kenapa container query, bukan breakpoint layar:** di desktop kartu form-nya cuma 380px, jadi `sm:grid-cols-6` bikin tiap tile 57px. Grid-nya ikut lebar kartu (`@container` + `@md:grid-cols-6`): 3 kolom di kartu sempit, 6 kolom kalau kartunya lebar.
- **Asetnya dari agregator pihak ketiga, bukan halaman brand resmi.** Dua hal yang perlu diketahui:
  - File Smartfren aslinya membawa watermark zonalogo.com — kotak solid di pojok kanan bawah (x 110–132, y 102–123). Sudah dihapus di `public/images/operator/smartfren.png`, setelah dipastikan area itu tidak bersinggungan dengan logo (di baris tersebut logonya cuma ada di x 90–96).
  - `theree.png` sebenarnya brand "Three" versi luar negeri, bukan logo Tri Indonesia, dan bentuknya mark hitam monokrom.
  Kalau ada aset resmi dari halaman brand masing-masing operator, tinggal ganti filenya — nama dan path-nya tidak perlu diubah.

## Pusat Bantuan (/pusat-bantuan)

Halaman bantuan yang dibuka dari tombol **Bantuan** di header (desktop) dan kolom Bantuan di footer. `externalLinks.helpCenter` sekarang menunjuk ke route ini, bukan `"#"`.

- **Search-first.** Kolom cari di hero menyaring seluruh artikel secara langsung, chip di bawahnya menyaring per topik, dan hasilnya tetap dikelompokkan per topik — jadi struktur bantuannya tetap kelihatan sambil difilter. Ada counter hasil dan empty state yang mengarahkan ke Cek Transaksi.
- Isi artikelnya di `src/data/help.ts`, 15 artikel dalam 4 topik. Semuanya menjelaskan perilaku aplikasi yang sebenarnya: alur beli, batas pembayaran 24 jam, biaya layanan Rp 1.000, deteksi operator dari prefix, nomor stroom 20 digit, dan riwayat yang cuma tersimpan di perangkat.
- Topik **Umum** memakai `faqItems` yang sama dengan section Pertanyaan Umum di beranda, jadi dua tempat itu tidak bisa berbeda isi.
- **Tombol kontak muncul kondisional.** WhatsApp dan Email hanya dirender kalau `externalLinks.whatsapp` / `.email` diisi di `src/lib/site.ts`. Selama kosong, tombolnya tidak ada — daripada menampilkan tombol yang tidak ke mana-mana.
- Halamannya **indexable** (beda dengan `/bayar` dan `/cek-transaksi` yang `noindex`) dan sudah terdaftar di `src/app/sitemap.ts`.

## Halaman legal (/syarat-ketentuan, /kebijakan-privasi)

Dua dokumen legal yang sebelumnya masih `"#"` di `externalLinks`, sekarang route sungguhan dan terhubung dari dropdown Bantuan di header maupun kolom Bantuan di footer.

- Isinya di `src/data/legal.ts` (12 bagian per dokumen), dirender oleh satu komponen `LegalDocumentView` yang sama: header brand ringkas, daftar isi sticky di desktop, dan paragraf dengan lebar baca yang enak.
- Ditulis dari perilaku aplikasi yang sebenarnya — biaya layanan Rp 1.000, batas bayar 24 jam, riwayat transaksi yang tersimpan di browser, dan pihak ketiga yang benar-benar dipakai (operator/penyedia tagihan, penyedia pembayaran, infrastruktur).
- Daftar isinya pakai `useActiveHeading` (`src/lib/use-active-heading.ts`), bukan `useActiveSection` yang dipakai header. Alasannya: `useActiveSection` mengambil section **paling atas** yang berpotongan — pas untuk section landing yang berjarak jauh, tapi meleset di dokumen yang heading-nya rapat. Garis bacanya di 200px karena anchor di situs ini mendarat di 192px (`scroll-padding-top` 80px dari `globals.css` + `scroll-mt-28` 112px).

**TODO(legal): kedua dokumen ini belum ditinjau penasihat hukum.** Kalimatnya ditulis supaya aman dan sesuai perilaku aplikasi, tapi klausul soal pembatalan/pengembalian dana, retensi data, dan yurisdiksi tetap harus diperiksa sebelum diandalkan.

## Panel admin (/admin)

Masuk lewat `/admin/login` dengan satu password (`ADMIN_PASSWORD` di Vercel, bawaan
`belleva-admin-2026`), sesi 12 jam lewat cookie HttpOnly bertanda tangan HMAC. Panelnya punya
chrome sendiri — sidebar dan top bar — jadi navbar dan footer situs tidak pernah muncul di sini.

- **Ringkasan** — angka kunci plus pintasan ke tiap halaman.
- **Produk & harga** — ubah harga, tambah produk, sembunyikan produk bawaan, dan buat kategori
  sendiri.
- **Kelola pesanan** — cari, filter, dan ubah status pesanan. Perubahannya ikut terlihat di
  `/cek-transaksi` pembeli.
- **Pembayaran** — nama metode, langkah pembayaran, nomor rekening, dan unggah gambar QRIS
  (Cloudinary unsigned; gambarnya dihapus dari Cloudinary saat diganti).
- **Kontak** — WhatsApp, email, dan tautan halaman.

Katalognya satu baris `site_content` ber-key `product_catalogue` berisi `prices` (hanya yang beda
dari bawaan), `addedItems`, `hiddenItems`, dan `addedGroups`. Katalog di beranda dan halaman bayar
membaca hasil yang sama, jadi harga yang tampil dan yang ditagih tidak bisa berbeda.

**Kategori buatan sendiri** (`addedGroups`) dibuat dari panel tanpa deploy: nama, ikon, nama kolom
nomor pelanggan, contoh isian, keterangan, dan gaya tampilan produk. Hanya alur **prabayar** yang
ditawarkan — kategori pascabayar akan menjanjikan pengecekan tagihan untuk tagihan yang tidak ada.
`ProductGroupId` sengaja diakhiri `(string & {})` supaya id bawaan tetap punya autocomplete
sementara id buatan panel tetap diterima.

Form tambah produk memilih kategorinya sendiri (terisi tab yang sedang dibuka, dan bisa diganti di
situ), karena "tadi saya ada di tab mana" bukan hal yang pantas diingat-ingat user. Tombol simpan
selalu menyatakan apakah ada perubahan yang belum disimpan, dan setiap aksi melapor lewat toast
yang bisa membawa satu langkah lanjutan: **Urungkan** untuk sembunyikan/hapus, **Simpan sekarang**
setelah menambah produk.

## Cara maintain

- **Nambah operator / denominasi / paket data** → edit `src/data/products.ts` (termasuk `operatorPrefixes` buat deteksi).
- **Ganti teks FAQ / fitur / langkah / testimoni** → file di `src/data/`.
- **Ganti metode bayar / channel** → `src/data/payment-methods.ts`.
- **Ganti warna brand, shadow, radius** → token di `@theme` dalam `src/app/globals.css`.
- **Ganti domain** → set env `NEXT_PUBLIC_SITE_URL` (default `https://belleva.net`).

## Yang masih perlu diisi manual

Lihat `src/lib/site.ts` → `externalLinks`. Semua nilai di sana masih `"#"` seperti di HTML asli:

`signUp` (tujuan tombol CTA di section Daftar), `allProducts`, `contact`, `whatsapp`, `email`.

Selain itu:

- `public/images/logo-belleva-mark.png` — salinan mark dari `src/app/icon.png`, dipakai di app bar mobile. Mark-nya biru, jadi ditaruh di dalam tile putih biar tetap kontras di atas app bar biru. Kalau app icon-nya diganti, salin ulang file ini.
- `src/data/products.ts` — **harga & nama paket data masih placeholder** (demo biar alurnya bisa dicoba). Cuma harga pulsa Telkomsel yang dari HTML asli. Daftar prefix operator juga perlu dicek lagi ke daftar resmi operator.
- `src/data/payment-methods.ts` — **nomor rekening bank masih ngasal/demo** (atas nama "PT BELLEVA INDONESIA"), "Sisa saldo Rp 250.000" masih hardcode, dan **payload QRIS masih demo** (bukan QRIS asli dari payment gateway).
- `src/data/testimonials.ts` — baru 1 testimoni (sesuai HTML asli).
- Pembayaran masih simulasi: QR / no. rekening muncul normal, tapi belum ada verifikasi otomatis — status lunas ditandai lewat tombol **Saya Sudah Bayar**. Perlu integrasi payment gateway supaya statusnya real.

## Deploy

Static + ISR friendly. Deploy ke Vercel (atau host Node lain) — tidak ada environment variable wajib.
