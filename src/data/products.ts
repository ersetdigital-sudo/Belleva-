import type { ProductGroup, Vendor } from "@/types";

/**
 * Operator prefixes for auto-detection (Indonesian numbering plan).
 * TODO(content): verify against each operator's official prefix list.
 */
const PREFIXES: Record<string, string[]> = {
  telkomsel: ["0811", "0812", "0813", "0821", "0822", "0823", "0851", "0852", "0853"],
  indosat: ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
  xl: ["0817", "0818", "0819", "0859", "0877", "0878"],
  axis: ["0831", "0832", "0833", "0838"],
  tri: ["0895", "0896", "0897", "0898", "0899"],
  smartfren: ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"],
};

/** Data packages — shared shape, price varies per operator. */
function paketData(prices: number[]): Vendor["items"] {
  const plan = [
    { key: "d1", name: "Kuota Harian", headline: "1 GB", meta: "Masa aktif 1 hari · 4G/5G" },
    { key: "d5", name: "Kuota Mingguan", headline: "5 GB", meta: "Masa aktif 7 hari · 4G/5G" },
    { key: "d12", name: "Kuota Utama", headline: "12 GB", meta: "Masa aktif 30 hari · 4G/5G" },
    { key: "d25", name: "Kuota Utama", headline: "25 GB", meta: "Masa aktif 30 hari · 4G/5G" },
    { key: "unl", name: "Unlimited Harian", headline: "Unlimited", meta: "Masa aktif 30 hari · FUP" },
  ];
  const badges = [undefined, "Hemat 15%", "Terlaris", "Best Deal", undefined];

  return plan.map((entry, index) => {
    const price = prices[index];
    const discount = badges[index] ? Math.round((price * 15) / 100) * 5 : 0;
    return {
      id: entry.key,
      name: entry.name,
      headline: entry.headline,
      meta: entry.meta,
      price,
      originalPrice: discount ? price + discount : undefined,
      badge: badges[index],
    };
  });
}

const operatorVendors: Vendor[] = [
  {
    id: "telkomsel",
    label: "Telkomsel",
    prefixes: PREFIXES.telkomsel,
    baseAmount: 55000,
  },
  { id: "xl", label: "XL", prefixes: PREFIXES.xl, baseAmount: 45000 },
  { id: "indosat", label: "Indosat", prefixes: PREFIXES.indosat, baseAmount: 50000 },
  { id: "tri", label: "Tri", prefixes: PREFIXES.tri, baseAmount: 40000 },
  { id: "smartfren", label: "Smartfren", prefixes: PREFIXES.smartfren, baseAmount: 45000 },
  { id: "axis", label: "Axis", prefixes: PREFIXES.axis, baseAmount: 38000 },
];

// Per-operator nominals. Only the Telkomsel pulsa prices come from the source
// HTML; everything below is placeholder catalogue content (TODO(content)).
const PULSA_PRICES: Record<string, number[]> = {
  telkomsel: [5950, 10450, 15450, 20950, 25450, 30450, 50450, 99950, 199950],
  xl: [5900, 10400, 15400, 25400, 50400, 99900],
  indosat: [5900, 10450, 20900, 25400, 50400, 99900],
  tri: [5850, 10350, 20850, 50350, 99850],
  smartfren: [10400, 20900, 25400, 50400, 99900],
  axis: [5850, 10350, 20850, 25400, 50350],
};

const DATA_PRICES: Record<string, number[]> = {
  telkomsel: [3500, 18000, 55000, 85000, 100000],
  xl: [3000, 15000, 45000, 75000, 90000],
  indosat: [3000, 16000, 50000, 80000, 95000],
  tri: [2500, 13000, 40000, 70000, 85000],
  smartfren: [3000, 14000, 45000, 72000, 88000],
  axis: [2500, 12000, 38000, 65000, 80000],
};

const PULSA_SUFFIX = ["5", "10", "15", "20", "25", "30", "50", "100", "200"];
const PULSA_SUFFIX_SHORT = ["5", "10", "20", "50", "100"];
const PULSA_SUFFIX_MID = ["5", "10", "15", "25", "50", "100"];

function pulsaItems(id: string, prices: number[], suffixes: string[]) {
  return prices.map((price, index) => ({
    id: `${id}-${index}`,
    name: `Pulsa ${suffixes[index]}.000`,
    headline: `${suffixes[index]}.000`,
    price,
  }));
}

export const productGroups: ProductGroup[] = [
  /* ------------------------------- PRABAYAR ------------------------------ */
  {
    id: "pulsa",
    icon: "pulsa",
    label: "Pulsa",
    title: "Pulsa",
    subtitle: "Isi nomor dulu, operator langsung terdeteksi dan harganya menyesuaikan.",
    flow: "prepaid",
    card: "row",
    vendorLabel: "Operator",
    customer: {
      label: "Nomor Handphone",
      placeholder: "81234567890",
      minLength: 10,
      maxLength: 13,
      hint: "Isi nomor dulu, operator langsung terdeteksi dan pulasnya menyesuaikan.",
    },
    vendors: operatorVendors.map((vendor) => ({
      ...vendor,
      items:
        vendor.id === "telkomsel"
          ? pulsaItems("tsel", PULSA_PRICES.telkomsel, PULSA_SUFFIX)
          : vendor.id === "xl" || vendor.id === "indosat"
            ? pulsaItems(vendor.id, PULSA_PRICES[vendor.id], PULSA_SUFFIX_MID)
            : pulsaItems(vendor.id, PULSA_PRICES[vendor.id], PULSA_SUFFIX_SHORT),
    })),
  },
  {
    id: "data",
    icon: "paket-data",
    label: "Paket Data",
    title: "Paket Data",
    subtitle: "Kuota, masa aktif, dan harga terlihat jelas sebelum kamu beli.",
    flow: "prepaid",
    card: "tile",
    vendorLabel: "Operator",
    customer: {
      label: "Nomor Handphone",
      placeholder: "81234567890",
      minLength: 10,
      maxLength: 13,
      hint: "Isi nomor dulu, operator langsung terdeteksi dan paketnya menyesuaikan.",
    },
    vendors: operatorVendors.map((vendor) => ({
      ...vendor,
      items: paketData(DATA_PRICES[vendor.id]),
    })),
  },
  {
    id: "pln-token",
    icon: "pln",
    label: "Token Listrik",
    title: "Token Listrik PLN",
    subtitle: "Beli token listrik, dapat 20 digit nomor stroom untuk meter prabayar kamu.",
    flow: "prepaid",
    card: "money",
    issueStroomCode: true,
    requiresValidation: true,
    customer: {
      label: "ID Pelanggan / No. Meter",
      placeholder: "54321098765",
      minLength: 11,
      maxLength: 12,
      hint: "11–12 digit, tertera di meter prabayar atau struk terakhir.",
    },
    items: [
      { id: "t20", name: "Token Listrik", headline: "Rp 20.000", price: 21500 },
      { id: "t50", name: "Token Listrik", headline: "Rp 50.000", price: 51500 },
      { id: "t100", name: "Token Listrik", headline: "Rp 100.000", price: 101500, badge: "Terlaris" },
      { id: "t200", name: "Token Listrik", headline: "Rp 200.000", price: 201500 },
      { id: "t500", name: "Token Listrik", headline: "Rp 500.000", price: 501500, badge: "Hemat" },
      { id: "t1000", name: "Token Listrik", headline: "Rp 1.000.000", price: 1001500 },
    ],
  },
  {
    id: "emoney",
    icon: "e-money",
    label: "E-Money",
    title: "Uang Elektronik",
    subtitle: "Top up e-money dan uang elektronik, saldo masuk dalam hitungan detik.",
    flow: "prepaid",
    card: "row",
    vendorLabel: "Uang Elektronik",
    customer: {
      label: "No. HP / No. Kartu",
      placeholder: "81234567890",
      minLength: 8,
      maxLength: 16,
      hint: "Nomor HP untuk e-wallet, atau 16 digit nomor kartu untuk e-money.",
    },
    vendors: [
      { id: "gopay", label: "GoPay", baseAmount: 10000 },
      { id: "ovo", label: "OVO", baseAmount: 10000 },
      { id: "dana", label: "DANA", baseAmount: 10000 },
      { id: "shopeepay", label: "ShopeePay", baseAmount: 10000 },
      { id: "linkaja", label: "LinkAja", baseAmount: 10000 },
      { id: "emoney", label: "e-Money Mandiri", baseAmount: 10000 },
    ].map((vendor) => ({
      ...vendor,
      items: [10, 20, 25, 50, 100, 200, 300, 500].map((ribu) => ({
        id: `${vendor.id}-${ribu}`,
        name: `Top Up Rp ${ribu}.000`,
        headline: `Rp ${ribu}.000`,
        price: ribu * 1000 + 1500,
      })),
    })),
  },

  /* ------------------------------- PASCABAYAR ---------------------------- */
  {
    id: "pln-bill",
    icon: "pln",
    label: "Tagihan Listrik",
    title: "Tagihan Listrik PLN",
    subtitle: "Cek dulu tagihan listrik pascabayar kamu, baru bayar kalau sudah cocok.",
    flow: "postpaid",
    card: "row",
    adminFee: 2750,
    customer: {
      label: "ID Pelanggan",
      placeholder: "54321098765",
      minLength: 11,
      maxLength: 12,
      hint: "11–12 digit ID Pelanggan PLN pascabayar.",
    },
  },
  {
    id: "pdam",
    icon: "pdam",
    label: "PDAM",
    title: "Air PDAM",
    subtitle: "Pilih wilayah PDAM-nya, masukkan nomor pelanggan, lalu cek tagihan.",
    flow: "postpaid",
    card: "row",
    adminFee: 2500,
    vendorLabel: "Wilayah",
    customer: {
      label: "No. Pelanggan",
      placeholder: "08123456",
      minLength: 6,
      maxLength: 12,
      hint: "Nomor pelanggan PDAM, tertera di kartu pelanggan atau struk terakhir.",
    },
    vendors: [
      { id: "pdam-jakarta", label: "PDAM Tirta Jaya — Jakarta", baseAmount: 145000 },
      { id: "pdam-bandung", label: "PDAM Tirtawening — Bandung", baseAmount: 125000 },
      { id: "pdam-surabaya", label: "PDAM Surya Sembada — Surabaya", baseAmount: 118000 },
      { id: "pdam-semarang", label: "PDAM Tirta Moedal — Semarang", baseAmount: 98000 },
      { id: "pdam-depok", label: "PDAM Tirta Asasta — Depok", baseAmount: 132000 },
      { id: "pdam-palembang", label: "PDAM Tirta Musi — Palembang", baseAmount: 89000 },
      { id: "pdam-makassar", label: "PDAM Tirta Mangkaluku — Makassar", baseAmount: 94000 },
      { id: "pdam-aceh", label: "PDAM Tirta Daroy — Banda Aceh", baseAmount: 76000 },
      { id: "pdam-ciamis", label: "PDAM Tirta Ciamis — Ciamis", baseAmount: 68000 },
      { id: "pdam-malang", label: "PDAM Tugu Tirta — Malang", baseAmount: 82000 },
    ],
  },
  {
    id: "bpjs",
    icon: "bpjs",
    label: "BPJS",
    title: "BPJS",
    subtitle: "Bayar iuran BPJS, jumlah bulan bebas dipilih sebelum cek tagihan.",
    flow: "postpaid",
    card: "row",
    adminFee: 2500,
    vendorLabel: "Jenis Kepesertaan",
    customer: {
      label: "No. Kepesertaan / VA",
      placeholder: "0001234567890",
      minLength: 13,
      maxLength: 13,
      hint: "13 digit nomor kepesertaan BPJS Kesehatan (atau nomor VA).",
    },
    choice: {
      label: "Bayar untuk",
      options: [
        { id: "1", label: "1 bulan", multiplier: 1 },
        { id: "2", label: "2 bulan", multiplier: 2 },
        { id: "3", label: "3 bulan", multiplier: 3 },
        { id: "6", label: "6 bulan", multiplier: 6 },
        { id: "12", label: "12 bulan", multiplier: 12 },
      ],
    },
    vendors: [
      { id: "k1", label: "Kesehatan Kelas I", baseAmount: 150000 },
      { id: "k2", label: "Kesehatan Kelas II", baseAmount: 100000 },
      { id: "k3", label: "Kesehatan Kelas III", baseAmount: 35000 },
      { id: "tk", label: "Ketenagakerjaan", baseAmount: 22000 },
    ],
  },
  {
    id: "internet",
    icon: "internet",
    label: "Internet",
    title: "Internet & Telepon",
    subtitle: "Tagihan internet, telepon, dan TV kabel dalam satu tempat.",
    flow: "postpaid",
    card: "row",
    adminFee: 2500,
    vendorLabel: "Penyedia",
    customer: {
      label: "No. Pelanggan",
      placeholder: "1234567890",
      minLength: 6,
      maxLength: 14,
      hint: "Nomor pelanggan sesuai tagihan penyedia internet kamu.",
    },
    vendors: [
      { id: "indihome", label: "IndiHome", baseAmount: 395000 },
      { id: "myrepublic", label: "MyRepublic", baseAmount: 299000 },
      { id: "firstmedia", label: "First Media", baseAmount: 449000 },
      { id: "biznet", label: "Biznet", baseAmount: 385000 },
      { id: "iconnet", label: "iConnet", baseAmount: 275000 },
      { id: "oxygen", label: "Oxygen.id", baseAmount: 330000 },
      { id: "transvision", label: "TransVision", baseAmount: 185000 },
    ],
  },
  {
    id: "multifinance",
    icon: "multifinance",
    label: "Angsuran",
    title: "Angsuran Multifinance",
    subtitle: "Bayar cicilan motor, mobil, atau elektronik — cek dulu angsurannya.",
    flow: "postpaid",
    card: "row",
    adminFee: 5000,
    vendorLabel: "Leasing",
    customer: {
      label: "No. Kontrak",
      placeholder: "123456789012",
      minLength: 10,
      maxLength: 14,
      hint: "Nomor kontrak pada perjanjian pembiayaan (Adira: 12 digit).",
    },
    vendors: [
      { id: "adira", label: "Adira Finance", baseAmount: 1250000 },
      { id: "fif", label: "FIF Group", baseAmount: 950000 },
      { id: "wom", label: "WOM Finance", baseAmount: 780000 },
      { id: "baf", label: "Bussan Auto Finance (BAF)", baseAmount: 650000 },
      { id: "mpm", label: "MPM Finance", baseAmount: 720000 },
      { id: "bfi", label: "BFI Finance", baseAmount: 1450000 },
    ],
  },
];

export const defaultGroupId = productGroups[0].id;
