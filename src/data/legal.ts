import type { LegalDocument } from "@/types";

/**
 * Isi halaman Syarat & Ketentuan dan Kebijakan Privasi.
 *
 * Ditulis dari perilaku aplikasi yang sebenarnya — biaya layanan, batas bayar
 * 24 jam, riwayat transaksi yang tersimpan di server, data yang dikirim ke
 * Supabase dan Cloudinary. Yang belum bisa saya pastikan (kebijakan refund,
 * retensi data, yurisdiksi) ditulis sebagai kebijakan yang aman dan ditandai
 * TODO(content) di README supaya diperiksa sebelum dipakai.
 *
 * TODO(legal): kedua dokumen ini belum ditinjau penasihat hukum.
 */

const UPDATED = "24 September 2026";

export const termsDocument: LegalDocument = {
  slug: "syarat-ketentuan",
  title: "Syarat & Ketentuan",
  summary:
    "Aturan pemakaian layanan Belleva: apa yang kamu dapat, apa yang kami minta, dan batasannya.",
  updated: UPDATED,
  sections: [
    {
      id: "layanan",
      heading: "1. Tentang layanan ini",
      paragraphs: [
        "Belleva adalah layanan pembayaran digital untuk pembelian produk prabayar (pulsa, paket data, token listrik, uang elektronik) dan pembayaran tagihan pascabayar (listrik, PDAM, BPJS, internet, dan angsuran).",
        "Dengan menggunakan Belleva, kamu dianggap sudah membaca dan menyetujui syarat ini. Kalau tidak setuju, mohon berhenti menggunakan layanan.",
      ],
    },
    {
      id: "data-pelanggan",
      heading: "2. Data yang kamu masukkan",
      paragraphs: [
        "Kamu bertanggung jawab atas kebenaran nomor HP, ID pelanggan, nomor meter, atau nomor kontrak yang kamu masukkan. Produk prabayar dikirim ke nomor yang kamu isi dan tidak bisa ditarik kembali, jadi periksa nomornya sebelum membayar.",
      ],
      bullets: [
        "Nomor HP ditulis dengan awalan +62; angka 0 di depan otomatis dibuang.",
        "Operator dideteksi dari prefix nomor. Kalau nomor belum dikenali, kamu memilih operatornya secara manual.",
        "Kami tidak meminta PIN, OTP, atau data perbankan apa pun di luar proses pembayaran yang ditampilkan.",
      ],
    },
    {
      id: "transaksi",
      heading: "3. Transaksi dan pembayaran",
      paragraphs: [
        "Setelah kamu memilih nominal atau paket, pesanannya masuk ke halaman pembayaran. Kamu punya waktu 24 jam untuk menyelesaikannya; lewat dari itu pesanannya dibatalkan otomatis dan kamu bisa mengulang.",
        "Untuk transfer bank, kirim dana dengan nominal tepat seperti yang tertera supaya pembayarannya mudah dicocokkan dengan pesananmu.",
      ],
    },
    {
      id: "harga",
      heading: "4. Harga dan biaya",
      paragraphs: [
        "Biaya layanan Rp 1.000 per transaksi prabayar, ditambahkan di atas harga produk. Untuk tagihan pascabayar, biaya adminnya mengikuti jenis tagihan dan ditampilkan sebelum kamu membayar.",
        "Harga yang berlaku adalah harga yang muncul di halaman pembayaran pada saat kamu bertransaksi.",
      ],
    },
    {
      id: "pembatalan",
      heading: "5. Pembatalan dan pengembalian dana",
      paragraphs: [
        "Pesanan yang tidak dibayar dalam 24 jam otomatis dibatalkan dan tidak ada dana yang terpotong.",
        "Kalau pembayaran sudah kamu lakukan tetapi produknya tidak terkirim, dana dikembalikan setelah kami verifikasi. Ajukan lewat Customer Support dengan menyertakan nomor referensi transaksimu.",
      ],
    },
    {
      id: "larangan",
      heading: "6. Penggunaan yang dilarang",
      bullets: [
        "Memakai Belleva untuk tindakan yang melanggar hukum, termasuk penipuan dan pencucian uang.",
        "Mengakses layanan dengan cara otomatis yang membebani sistem, atau mencoba menembus pembatasan keamanan.",
        "Mengisi nomor atau identitas milik orang lain tanpa izin.",
      ],
    },
    {
      id: "ketersediaan",
      heading: "7. Ketersediaan layanan",
      paragraphs: [
        "Kami berusaha menjaga layanan tetap tersedia, tetapi pemrosesan produk bergantung pada sistem operator dan penyedia tagihan di luar kendali kami. Gangguan pada pihak tersebut bisa membuat transaksi tertunda.",
      ],
    },
    {
      id: "tanggung-jawab",
      heading: "8. Batasan tanggung jawab",
      paragraphs: [
        "Kami tidak bertanggung jawab atas kerugian yang timbul karena data yang kamu masukkan salah, kelalaianmu menjaga akses perangkat, atau gangguan pada layanan pihak ketiga.",
      ],
    },
    {
      id: "kekayaan-intelektual",
      heading: "9. Hak kekayaan intelektual",
      paragraphs: [
        "Nama, logo, dan seluruh isi halaman Belleva dilindungi hukum. Kamu tidak boleh memakainya untuk kepentingan komersial tanpa izin tertulis dari kami.",
      ],
    },
    {
      id: "perubahan",
      heading: "10. Perubahan syarat",
      paragraphs: [
        "Syarat ini bisa kami ubah mengikuti perkembangan layanan dan peraturan. Versi terbaru selalu ditampilkan di halaman ini beserta tanggal pembaruannya.",
      ],
    },
    {
      id: "hukum",
      heading: "11. Hukum yang berlaku",
      paragraphs: [
        "Syarat ini tunduk pada hukum yang berlaku di Republik Indonesia.",
      ],
    },
    {
      id: "kontak",
      heading: "12. Hubungi kami",
      paragraphs: [
        "Pertanyaan soal syarat ini bisa disampaikan lewat kanal bantuan yang tertera di situs.",
      ],
    },
  ],
};

export const privacyDocument: LegalDocument = {
  slug: "kebijakan-privasi",
  title: "Kebijakan Privasi",
  summary:
    "Data apa yang kami kumpulkan, untuk apa, di mana disimpan, dan bagaimana kamu bisa mengendalikannya.",
  updated: UPDATED,
  sections: [
    {
      id: "ringkasan",
      heading: "1. Ringkasan",
      paragraphs: [
        "Kami mengumpulkan data seperlunya saja: cukup untuk memproses transaksi yang kamu minta, dan tidak lebih. Kami tidak menjual data pengguna.",
      ],
    },
    {
      id: "data",
      heading: "2. Data yang kami kumpulkan",
      bullets: [
        "Nomor tujuan atau ID pelanggan yang kamu isi, karena itu yang menentukan produk dikirim ke mana.",
        "Rincian transaksi: produk, nominal, metode pembayaran, status, dan nomor referensi.",
        "Data teknis dasar dari server, seperti waktu akses, berguna untuk keamanan dan penelusuran gangguan.",
      ],
    },
    {
      id: "penggunaan",
      heading: "3. Cara kami memakai data",
      bullets: [
        "Memproses dan mengirim produk yang kamu beli.",
        "Menampilkan status transaksi dan menangani keluhan.",
        "Menjaga layanan dari penyalahgunaan dan memenuhi kewajiban hukum yang berlaku.",
      ],
    },
    {
      id: "riwayat-server",
      heading: "4. Riwayat transaksi di server kami",
      paragraphs: [
        "Saat kamu menyelesaikan checkout, rincian pesanannya kami simpan di server: nomor tujuan atau ID pelanggan, produk yang dibeli, metode pembayaran, jumlah tagihan, status, dan waktu transaksinya — termasuk nomor referensinya.",
        "Penyimpanan ini yang membuat halaman Cek Transaksi bisa dipakai dari perangkat mana pun. Untuk membukanya, masukkan nomor referensi transaksimu atau nomor tujuan yang kamu pakai saat bertransaksi.",
        "Data ini kami simpan selama diperlukan untuk menangani keluhan dan memenuhi kewajiban pencatatan, dan kamu bisa meminta penghapusannya lewat kanal bantuan kami.",
      ],
    },
    {
      id: "pihak-ketiga",
      heading: "5. Berbagi data dengan pihak ketiga",
      paragraphs: [
        "Data hanya diteruskan sejauh yang diperlukan untuk menyelesaikan transaksimu:",
      ],
      bullets: [
        "Operator atau penyedia tagihan, supaya produknya bisa dikirim ke nomor atau ID yang kamu masukkan.",
        "Penyedia layanan pembayaran, untuk memproses pembayaran yang kamu pilih.",
        "Penyedia infrastruktur dan penyimpanan gambar, untuk menjalankan situs dan menampilkan berkas pendukung seperti gambar QRIS.",
      ],
    },
    {
      id: "cookie",
      heading: "6. Cookie dan penyimpanan lokal",
      paragraphs: [
        "Kami tidak memakai cookie untuk periklanan, dan tidak melacak aktivitasmu di situs lain.",
        "Satu cookie dipakai untuk sesi masuk panel admin, dan itu hanya untuk pengelola situs. Riwayat transaksi tidak disimpan di browser, melainkan di server seperti dijelaskan di bagian 4.",
      ],
    },
    {
      id: "keamanan",
      heading: "7. Keamanan data",
      paragraphs: [
        "Akses ke data transaksi dibatasi dan hanya dibuka sejauh yang dibutuhkan untuk memproses pesanan serta menangani keluhan. Data antar-sistem dikirim lewat koneksi terenkripsi.",
      ],
    },
    {
      id: "retensi",
      heading: "8. Berapa lama data disimpan",
      paragraphs: [
        "Data transaksi disimpan selama diperlukan untuk keperluan operasional, pengelolaan keluhan, dan pemenuhan kewajiban pembukuan yang berlaku. Setelah itu data dihapus atau dianonimkan.",
      ],
    },
    {
      id: "hak",
      heading: "9. Hakmu atas data",
      bullets: [
        "Meminta salinan data pribadi yang kami pegang terkait transaksimu.",
        "Meminta perbaikan kalau datanya tidak akurat.",
        "Meminta penghapusan data, sejauh tidak bertentangan dengan kewajiban hukum yang harus kami penuhi.",
      ],
    },
    {
      id: "anak",
      heading: "10. Pengguna di bawah umur",
      paragraphs: [
        "Layanan ini ditujukan untuk pengguna yang sudah cakap secara hukum. Kami tidak dengan sengaja mengumpulkan data anak di bawah umur.",
      ],
    },
    {
      id: "perubahan",
      heading: "11. Perubahan kebijakan",
      paragraphs: [
        "Kebijakan ini bisa diperbarui mengikuti perubahan layanan atau aturan yang berlaku. Versi terbaru dan tanggal pembaruannya selalu ditampilkan di halaman ini.",
      ],
    },
    {
      id: "kontak",
      heading: "12. Menghubungi kami soal privasi",
      paragraphs: [
        "Permintaan terkait data pribadi bisa disampaikan lewat kanal bantuan yang tertera di situs, dengan menyertakan nomor referensi transaksimu supaya bisa kami telusuri.",
      ],
    },
  ],
};

export const legalDocuments = [termsDocument, privacyDocument];
