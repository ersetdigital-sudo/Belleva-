-- Data pesanan contoh, untuk melihat tampilan panel admin.
--
-- Semua baris memakai awalan referensi BLV9 supaya gampang dihapus lagi:
--   delete from public.orders where reference like 'BLV9%';
--
-- Isinya sengaja dibuat masuk akal: nomor HP sesuai prefix operatornya, nama
-- produk dan harga mengikuti katalog, dan total prabayar sudah termasuk biaya
-- layanan Rp 1.000. Titik tengah (·) ditulis lewat chr(183) supaya tidak rusak
-- saat dikirim dari shell.

insert into public.orders (reference, customer, product_name, group_label, vendor_label, method, total, status, created_at) values
  ('BLV90000001', '081234567890', 'Pulsa 10.000',        'Pulsa',         'Telkomsel',       'QRIS',                                11450, 'berhasil', now() - interval '9 days'),
  ('BLV90000002', '085712345678', 'Pulsa 25.000',        'Pulsa',         'Indosat',         'Transfer Bank ' || chr(183) || ' BCA',  26450, 'berhasil', now() - interval '8 days' - interval '3 hours'),
  ('BLV90000003', '081745678901', 'Kuota Utama 12 GB',   'Paket Data',    'XL',              'QRIS',                                76450, 'berhasil', now() - interval '8 days'),
  ('BLV90000004', '089512345678', 'Pulsa 5.000',         'Pulsa',         'Tri',             'E-Wallet ' || chr(183) || ' GoPay',     6950, 'berhasil', now() - interval '7 days' - interval '5 hours'),
  ('BLV90000005', '12345678901',  'Token PLN 50.000',    'Token Listrik', 'PLN',             'QRIS',                                51450, 'berhasil', now() - interval '7 days'),
  ('BLV90000006', '081399887766', 'Pulsa 100.000',       'Pulsa',         'Telkomsel',       'Transfer Bank ' || chr(183) || ' Mandiri', 100950, 'berhasil', now() - interval '6 days'),
  ('BLV90000007', '088112345678', 'Pulsa 15.000',        'Pulsa',         'Smartfren',       'Saldo Belleva',                       16450, 'berhasil', now() - interval '6 days' - interval '2 hours'),
  ('BLV90000008', '081255667788', 'Kuota Mingguan 5 GB', 'Paket Data',    'Telkomsel',       'QRIS',                                55450, 'berhasil', now() - interval '5 days'),
  ('BLV90000009', '085799001122', 'Pulsa 10.000',        'Pulsa',         'Indosat',         'QRIS',                                11450, 'gagal',    now() - interval '5 days' - interval '7 hours'),
  ('BLV90000010', '081200112233', 'Token PLN 100.000',   'Token Listrik', 'PLN',             'Transfer Bank ' || chr(183) || ' BCA', 101450, 'berhasil', now() - interval '4 days'),
  ('BLV90000011', '087812345678', 'Pulsa 20.000',        'Pulsa',         'XL',              'E-Wallet ' || chr(183) || ' OVO',      21450, 'menunggu', now() - interval '3 days'),
  ('BLV90000012', '081234000111', 'GoPay 50.000',        'E-Money',       'GoPay',           'QRIS',                                51450, 'berhasil', now() - interval '3 days' - interval '4 hours'),
  ('BLV90000013', '1801234567',   'Tagihan Listrik',     'Tagihan Listrik','PLN',            'QRIS',                               342100, 'berhasil', now() - interval '2 days'),
  ('BLV90000014', '081255001122', 'Pulsa 30.000',        'Pulsa',         'Telkomsel',       'QRIS',                                31450, 'menunggu', now() - interval '2 days' - interval '6 hours'),
  ('BLV90000015', '089512340099', 'Unlimited Harian',    'Paket Data',    'Tri',             'QRIS',                                61450, 'berhasil', now() - interval '1 day'),
  ('BLV90000016', '088811223344', 'OVO 25.000',          'E-Money',       'OVO',             'Saldo Belleva',                       26450, 'menunggu', now() - interval '1 day' - interval '8 hours'),
  ('BLV90000017', '085711223344', 'Pulsa 10.000',        'Pulsa',         'Indosat',         'QRIS',                                11450, 'menunggu', now() - interval '7 hours'),
  ('BLV90000018', '081377889900', 'BPJS Kesehatan',      'BPJS',          'BPJS Kesehatan',  'Transfer Bank ' || chr(183) || ' BNI',  182500, 'menunggu', now() - interval '3 hours'),
  ('BLV90000019', '081233445566', 'Pulsa 50.000',        'Pulsa',         'Telkomsel',       'QRIS',                                50950, 'gagal',    now() - interval '2 hours'),
  ('BLV90000020', '087755667788', 'PDAM Surabaya',       'PDAM',          'PDAM Surabaya',   'QRIS',                                128450, 'menunggu', now() - interval '25 minutes')
on conflict (reference) do nothing;

-- Id katalog untuk baris yang produknya jelas (pulsa Telkomsel memakai
-- tsel-<indeks> dari src/data/products.ts). Tanpa ini kartu "menunggu" tidak
-- punya tombol Lanjutkan pembayaran, karena halaman bayar tidak bisa
-- menyelesaikan pesanan tanpa tahu item mana yang dibeli.
update public.orders set group_id = 'pulsa', vendor_id = 'telkomsel', item_id = 'tsel-1', status = 'menunggu' where reference = 'BLV90000001';
update public.orders set group_id = 'pulsa', vendor_id = 'telkomsel', item_id = 'tsel-7' where reference = 'BLV90000006';
update public.orders set group_id = 'pulsa', vendor_id = 'telkomsel', item_id = 'tsel-5' where reference = 'BLV90000014';
update public.orders set group_id = 'pulsa', vendor_id = 'telkomsel', item_id = 'tsel-6' where reference = 'BLV90000019';
