import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { InputJsonValue } from "@prisma/client/runtime/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

async function findOrCreate<T>(
  find: () => Promise<T | null>,
  create: () => Promise<T>,
): Promise<T> {
  const existing = await find();
  if (existing) return existing;
  return create();
}

async function seedAdmin() {
  const username = process.env.DEFAULT_ADMIN_USERNAME ?? "admin";
  const password = process.env.DEFAULT_ADMIN_PASSWORD ?? "123456789";
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const admin = await findOrCreate(
    () => prisma.user.findFirst({ where: { username, deletedAt: null } }),
    () =>
      prisma.user.create({
        data: {
          username,
          name: "Administrator",
          email: "admin@cetak-transkrip.local",
          passwordHash,
          role: "ADMIN",
          isActive: true,
        },
      }),
  );

  console.log(`  User admin siap (username: ${admin.username})`);
  return admin;
}

async function seedSettings() {
  const settings: { key: string; value: InputJsonValue; description: string }[] = [
    {
      key: "institution_name",
      value: "Universitas Contoh Palembang",
      description: "Nama institusi, ditampilkan di header transkrip",
    },
    {
      key: "institution_address",
      value: "Jl. Pendidikan No. 1, Palembang, Sumatera Selatan",
      description: "Alamat institusi",
    },
    {
      key: "akreditasi_no_sk",
      value: "2759/SK/BAN-PT/Ak-PKP/S/V/2020",
      description: "Nomor SK BAN-PT, dicetak pada baris akreditasi di header transkrip",
    },
    {
      key: "letterhead_logo_url",
      value: "/images/logo.png",
      description: "Logo/letterhead untuk dokumen cetak",
    },
    {
      key: "simakad_base_url",
      value: "https://simakad.um-palembang.ac.id",
      description: "Base URL sistem SIMAKAD eksternal, sumber data nilai/IPK live",
    },
    {
      key: "scrape_timeout_ms",
      value: 15000,
      description: "Timeout (ms) saat mengambil data dari SIMAKAD",
    },
    {
      key: "predikat_thresholds",
      value: [
        { label: "Dengan Pujian", minIpk: 3.51, maxIpk: 4.0 },
        { label: "Sangat Memuaskan", minIpk: 3.01, maxIpk: 3.5 },
        { label: "Memuaskan", minIpk: 2.76, maxIpk: 3.0 },
        { label: "Cukup", minIpk: 0, maxIpk: 2.75 },
      ],
      description: "Ambang batas IPK untuk menghitung predikat kelulusan (urut menurun)",
    },
    {
      key: "print_paper_size",
      value: "F4",
      description: "Ukuran kertas cetak transkrip (F4 = 210mm x 330mm)",
    },
    {
      key: "print_top_margin_cm",
      value: 4.5,
      description: "Margin atas cetak transkrip dalam cm (ruang kop surat)",
    },
    {
      key: "print_font",
      value: "Courier New",
      description: "Font cetak transkrip",
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log(`  ${settings.length} setting default siap`);
}

async function seedFakultasDanProdi() {
  const fakultasSeed = [
    { nama: "Fakultas Teknik", kode: "FT", dekan: "Dr. Ir. Ahmad Kurniawan, M.T." },
    { nama: "Fakultas Ekonomi dan Bisnis", kode: "FEB", dekan: "Dr. Siti Rahmawati, S.E., M.M." },
    { nama: "Fakultas Ilmu Komputer", kode: "FIK", dekan: "Dr. Budi Santoso, S.Kom., M.Kom." },
  ];

  const fakultasByNama = new Map<string, { id: number; nama: string }>();
  for (const fakultas of fakultasSeed) {
    const row = await findOrCreate(
      () => prisma.fakultas.findFirst({ where: { nama: fakultas.nama, deletedAt: null } }),
      () => prisma.fakultas.create({ data: fakultas }),
    );
    fakultasByNama.set(fakultas.nama, row);
  }

  const fakultasTeknik = fakultasByNama.get("Fakultas Teknik")!;
  const fakultasEkonomi = fakultasByNama.get("Fakultas Ekonomi dan Bisnis")!;
  const fakultasIlkom = fakultasByNama.get("Fakultas Ilmu Komputer")!;

  const prodiSeed = [
    {
      nama: "Teknik Informatika",
      kode: "TI",
      jenjang: "S1" as const,
      fakultasId: fakultasTeknik.id,
    },
    { nama: "Teknik Sipil", kode: "TS", jenjang: "S1" as const, fakultasId: fakultasTeknik.id },
    { nama: "Manajemen", kode: "MN", jenjang: "S1" as const, fakultasId: fakultasEkonomi.id },
    { nama: "Akuntansi", kode: "AK", jenjang: "S1" as const, fakultasId: fakultasEkonomi.id },
    { nama: "Sistem Informasi", kode: "SI", jenjang: "S1" as const, fakultasId: fakultasIlkom.id },
  ];

  const prodiList = [];
  for (const prodi of prodiSeed) {
    const created = await findOrCreate(
      () =>
        prisma.programStudi.findFirst({
          where: { fakultasId: prodi.fakultasId, nama: prodi.nama, deletedAt: null },
        }),
      () => prisma.programStudi.create({ data: prodi }),
    );
    prodiList.push(created);
  }

  console.log(`  3 fakultas dan ${prodiList.length} program studi siap`);
  return { fakultasTeknik, fakultasEkonomi, fakultasIlkom, prodiList };
}

async function seedAkreditasi() {
  await prisma.akreditasi.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nama: "Unggul",
      keterangan: "Akreditasi Institusi Perguruan Tinggi - BAN-PT",
      isActive: true,
    },
  });

  await prisma.akreditasi.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      nama: "Baik Sekali",
      keterangan: "Akreditasi periode sebelumnya",
      isActive: false,
    },
  });

  console.log("  2 data akreditasi siap (1 aktif)");
}

async function seedMahasiswa(prodiList: { id: number; nama: string; fakultasId: number }[]) {
  const prodiTI = prodiList.find((p) => p.nama === "Teknik Informatika")!;
  const prodiSI = prodiList.find((p) => p.nama === "Sistem Informasi")!;
  const prodiMN = prodiList.find((p) => p.nama === "Manajemen")!;

  const mahasiswaSeed = [
    {
      npm: "2019010001",
      nama: "Andi Pratama",
      tempatLahir: "Palembang",
      tanggalLahir: new Date("2001-03-15"),
      tahunMasuk: 2019,
      fakultasId: prodiTI.fakultasId,
      programStudiId: prodiTI.id,
      statusCetak: "SUDAH_CETAK" as const,
      tanggalLulus: new Date("2026-06-20"),
      judulSkripsi: "Sistem Informasi Manajemen Akademik Berbasis Web",
      noIjazah: "TI.2023.001",
      noSeri: "TRANS-2023-00001",
      tglSkDekan: new Date("2026-06-25"),
    },
    {
      npm: "2019010002",
      nama: "Bella Kusuma Wardani",
      tempatLahir: "Prabumulih",
      tanggalLahir: new Date("2001-07-22"),
      tahunMasuk: 2019,
      fakultasId: prodiTI.fakultasId,
      programStudiId: prodiTI.id,
      statusCetak: "BELUM_CETAK" as const,
      tanggalLulus: new Date("2023-08-20"),
      judulSkripsi: "Analisis Sentimen Media Sosial Menggunakan Machine Learning",
      noIjazah: null,
      noSeri: null,
      tglSkDekan: null,
    },
    {
      npm: "2020020015",
      nama: "Citra Ayu Lestari",
      tempatLahir: "Palembang",
      tanggalLahir: new Date("2002-01-10"),
      tahunMasuk: 2020,
      fakultasId: prodiSI.fakultasId,
      programStudiId: prodiSI.id,
      statusCetak: "BELUM_CETAK" as const,
      tanggalLulus: null,
      judulSkripsi: null,
      noIjazah: null,
      noSeri: null,
      tglSkDekan: null,
    },
    {
      npm: "2020030022",
      nama: "Dedi Setiawan",
      tempatLahir: "Lubuklinggau",
      tanggalLahir: new Date("2002-05-30"),
      tahunMasuk: 2020,
      fakultasId: prodiMN.fakultasId,
      programStudiId: prodiMN.id,
      statusCetak: "BELUM_CETAK" as const,
      tanggalLulus: null,
      judulSkripsi: null,
      noIjazah: null,
      noSeri: null,
      tglSkDekan: null,
    },
  ];

  const created = [];
  for (const mhs of mahasiswaSeed) {
    const row = await findOrCreate(
      () => prisma.mahasiswa.findFirst({ where: { npm: mhs.npm, deletedAt: null } }),
      () => prisma.mahasiswa.create({ data: mhs }),
    );
    created.push(row);
  }

  console.log(`  ${created.length} data mahasiswa contoh siap`);
  return created;
}

async function seedTranskripContoh(
  mahasiswaAndi: { id: number; npm: string; nama: string },
  adminId: number,
) {
  const existing = await prisma.transkrip.findFirst({ where: { mahasiswaId: mahasiswaAndi.id } });
  if (existing) {
    console.log("  Transkrip contoh sudah ada, dilewati");
    return;
  }

  const mataKuliahSnapshot = [
    {
      kodeMatakuliah: "TI101",
      namaMatakuliah: "Algoritma dan Pemrograman",
      hurufMutu: "A",
      angkaMutu: 4,
      sks: 3,
      bobotSks: 12,
    },
    {
      kodeMatakuliah: "TI102",
      namaMatakuliah: "Struktur Data",
      hurufMutu: "A",
      angkaMutu: 4,
      sks: 3,
      bobotSks: 12,
    },
    {
      kodeMatakuliah: "TI103",
      namaMatakuliah: "Basis Data",
      hurufMutu: "B",
      angkaMutu: 3,
      sks: 3,
      bobotSks: 9,
    },
    {
      kodeMatakuliah: "TI201",
      namaMatakuliah: "Pemrograman Web",
      hurufMutu: "A",
      angkaMutu: 4,
      sks: 3,
      bobotSks: 12,
    },
    {
      kodeMatakuliah: "TI202",
      namaMatakuliah: "Jaringan Komputer",
      hurufMutu: "B",
      angkaMutu: 3,
      sks: 2,
      bobotSks: 6,
    },
    {
      kodeMatakuliah: "TI301",
      namaMatakuliah: "Rekayasa Perangkat Lunak",
      hurufMutu: "A",
      angkaMutu: 4,
      sks: 3,
      bobotSks: 12,
    },
    {
      kodeMatakuliah: "TI302",
      namaMatakuliah: "Kecerdasan Buatan",
      hurufMutu: "B",
      angkaMutu: 3,
      sks: 3,
      bobotSks: 9,
    },
    {
      kodeMatakuliah: "TI401",
      namaMatakuliah: "Metodologi Penelitian",
      hurufMutu: "A",
      angkaMutu: 4,
      sks: 2,
      bobotSks: 8,
    },
    {
      kodeMatakuliah: "TI402",
      namaMatakuliah: "Kerja Praktik",
      hurufMutu: "A",
      angkaMutu: 4,
      sks: 2,
      bobotSks: 8,
    },
    {
      kodeMatakuliah: "TI999",
      namaMatakuliah: "Skripsi",
      hurufMutu: "A",
      angkaMutu: 4,
      sks: 6,
      bobotSks: 24,
    },
  ];

  const totalSks = mataKuliahSnapshot.reduce((sum, c) => sum + c.sks, 0);
  const totalBobotNilai = mataKuliahSnapshot.reduce((sum, c) => sum + c.bobotSks, 0);
  const ipk = totalBobotNilai / totalSks;

  await prisma.transkrip.create({
    data: {
      mahasiswaId: mahasiswaAndi.id,
      npmSnapshot: mahasiswaAndi.npm,
      namaSnapshot: mahasiswaAndi.nama,
      cetakOlehId: adminId,
      cetakOlehNamaSnapshot: "Administrator",
      noSeri: "TRANS-2023-00001",
      ipk,
      totalSks,
      totalBobotNilai,
      predikat: "Dengan Pujian",
      judulSkripsiSnapshot: "Sistem Informasi Manajemen Akademik Berbasis Web",
      // Bentuknya harus sama persis dengan TranskripBiodataSnapshot di
      // src/services/transkrip.service.ts — termasuk akreditasiLabel, dekanNama,
      // dan tanggalSuratKeputusan, yang semuanya ikut tercetak di PDF.
      biodataSnapshot: {
        nama: mahasiswaAndi.nama,
        tempatTanggalLahir: "Palembang, 15 Maret 2001",
        npm: mahasiswaAndi.npm,
        programPendidikan: "Strata 1",
        fakultas: "Fakultas Teknik",
        programStudi: "Teknik Informatika",
        konsentrasi: null,
        tanggalLulus: "20 Juni 2026",
        noIjazah: "TI.2023.001",
        akreditasiLabel: "Unggul",
        akreditasiNoSk: "2759/SK/BAN-PT/Ak-PKP/S/V/2020",
        dekanNama: "Dr. Ir. Ahmad Kurniawan, M.T.",
        tanggalSuratKeputusan: "25 Juni 2026",
      },
      mataKuliahSnapshot,
      scrapedAt: new Date("2026-06-25T10:00:00Z"),
      tanggalCetak: new Date("2026-06-25T10:05:00Z"),
    },
  });

  console.log("  1 transkrip contoh siap (Andi Pratama)");
}

async function main() {
  console.log("Seeding database...");

  const admin = await seedAdmin();
  await seedSettings();
  const { prodiList } = await seedFakultasDanProdi();
  await seedAkreditasi();
  const mahasiswaList = await seedMahasiswa(prodiList);
  await seedTranskripContoh(mahasiswaList[0], admin.id);

  console.log("Seeding selesai.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
