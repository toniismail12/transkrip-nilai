import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { buildExcelBuffer } from "@/lib/excel-export";
import { cellToDateString, cellToNumber, cellToString } from "@/lib/excel";
import { mahasiswaRepository } from "@/repositories/mahasiswa.repository";

const STATUS_CETAK_LABEL: Record<string, string> = {
  BELUM_CETAK: "Belum Dicetak",
  SUDAH_CETAK: "Sudah Dicetak",
};

const EXPORT_COLUMNS = [
  { header: "NPM", key: "npm", width: 18 },
  { header: "Nama", key: "nama", width: 28 },
  { header: "Tempat Lahir", key: "tempatLahir", width: 18 },
  { header: "Tanggal Lahir", key: "tanggalLahir", width: 16 },
  { header: "Tahun Masuk", key: "tahunMasuk", width: 12 },
  { header: "Fakultas", key: "fakultas", width: 26 },
  { header: "Program Studi", key: "programStudi", width: 26 },
  { header: "Status Cetak", key: "statusCetak", width: 14 },
  { header: "Tanggal Lulus", key: "tanggalLulus", width: 16 },
  { header: "Judul Skripsi", key: "judulSkripsi", width: 32 },
  { header: "Konsentrasi", key: "konsentrasi", width: 18 },
  { header: "No Ijazah", key: "noIjazah", width: 18 },
  { header: "No Seri", key: "noSeri", width: 18 },
  { header: "Tanggal SK Dekan", key: "tglSkDekan", width: 16 },
];

type ExportableMahasiswa = Awaited<ReturnType<typeof mahasiswaRepository.findAllForExport>>[number];

function formatDate(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export async function exportMahasiswaExcel(rows: ExportableMahasiswa[]) {
  const data = rows.map((row) => ({
    npm: row.npm,
    nama: row.nama,
    tempatLahir: row.tempatLahir,
    tanggalLahir: formatDate(row.tanggalLahir),
    tahunMasuk: row.tahunMasuk,
    fakultas: row.fakultas.nama,
    programStudi: row.programStudi.nama,
    statusCetak: STATUS_CETAK_LABEL[row.statusCetak] ?? row.statusCetak,
    tanggalLulus: formatDate(row.tanggalLulus),
    judulSkripsi: row.judulSkripsi ?? "",
    konsentrasi: row.konsentrasi ?? "",
    noIjazah: row.noIjazah ?? "",
    noSeri: row.noSeri ?? "",
    tglSkDekan: formatDate(row.tglSkDekan),
  }));

  return buildExcelBuffer("Mahasiswa", EXPORT_COLUMNS, data);
}

const HEADER_ALIASES: Record<string, string> = {
  npm: "npm",
  nama: "nama",
  tempatlahir: "tempatLahir",
  tanggallahir: "tanggalLahir",
  tahunmasuk: "tahunMasuk",
  fakultas: "fakultas",
  programstudi: "programStudi",
  tanggallulus: "tanggalLulus",
  judulskripsi: "judulSkripsi",
  konsentrasi: "konsentrasi",
  noijazah: "noIjazah",
  noseri: "noSeri",
  tanggalskdekan: "tglSkDekan",
};

function normalizeHeader(header: string) {
  return header.toLowerCase().replace(/[^a-z]/g, "");
}

export interface ImportRowFailure {
  row: number;
  npm: string;
  message: string;
}

export interface ImportMahasiswaResult {
  totalRows: number;
  successCount: number;
  failures: ImportRowFailure[];
}

export async function importMahasiswaExcel(buffer: Buffer): Promise<ImportMahasiswaResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    return { totalRows: 0, successCount: 0, failures: [] };
  }

  const headerRow = worksheet.getRow(1);
  const columnMap = new Map<string, number>();
  headerRow.eachCell((cell, colNumber) => {
    const key = HEADER_ALIASES[normalizeHeader(cellToString(cell.value))];
    if (key) columnMap.set(key, colNumber);
  });

  const failures: ImportRowFailure[] = [];
  let successCount = 0;
  let totalRows = 0;

  const fakultasCache = new Map<string, { id: number } | null>();
  const prodiCache = new Map<string, { id: number; fakultasId: number } | null>();

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    const getValue = (key: string) => {
      const colNumber = columnMap.get(key);
      return colNumber ? row.getCell(colNumber).value : null;
    };

    const npm = cellToString(getValue("npm"));
    const nama = cellToString(getValue("nama"));
    const isRowEmpty = !npm && !nama && row.actualCellCount === 0;
    if (isRowEmpty) continue;

    totalRows += 1;

    try {
      if (!npm) throw new Error("NPM wajib diisi");
      if (!nama) throw new Error("Nama wajib diisi");

      const tempatLahir = cellToString(getValue("tempatLahir"));
      if (!tempatLahir) throw new Error("Tempat lahir wajib diisi");

      const tanggalLahirStr = cellToDateString(getValue("tanggalLahir"));
      if (!tanggalLahirStr) throw new Error("Tanggal lahir wajib diisi dan valid");
      const tanggalLahir = new Date(tanggalLahirStr);

      const tahunMasuk = cellToNumber(getValue("tahunMasuk"));
      if (!tahunMasuk) throw new Error("Tahun masuk wajib diisi dan berupa angka");

      const fakultasNama = cellToString(getValue("fakultas"));
      if (!fakultasNama) throw new Error("Fakultas wajib diisi");

      let fakultas = fakultasCache.get(fakultasNama.toLowerCase());
      if (fakultas === undefined) {
        fakultas = await prisma.fakultas.findFirst({
          where: { nama: { equals: fakultasNama, mode: "insensitive" }, deletedAt: null },
          select: { id: true },
        });
        fakultasCache.set(fakultasNama.toLowerCase(), fakultas);
      }
      if (!fakultas) throw new Error(`Fakultas "${fakultasNama}" tidak ditemukan`);

      const prodiNama = cellToString(getValue("programStudi"));
      if (!prodiNama) throw new Error("Program studi wajib diisi");

      const prodiCacheKey = `${fakultas.id}:${prodiNama.toLowerCase()}`;
      let prodi = prodiCache.get(prodiCacheKey);
      if (prodi === undefined) {
        prodi = await prisma.programStudi.findFirst({
          where: {
            nama: { equals: prodiNama, mode: "insensitive" },
            fakultasId: fakultas.id,
            deletedAt: null,
          },
          select: { id: true, fakultasId: true },
        });
        prodiCache.set(prodiCacheKey, prodi);
      }
      if (!prodi) {
        throw new Error(
          `Program studi "${prodiNama}" tidak ditemukan pada fakultas "${fakultasNama}"`,
        );
      }

      const tanggalLulusStr = cellToDateString(getValue("tanggalLulus"));
      const tglSkDekanStr = cellToDateString(getValue("tglSkDekan"));

      const writeData = {
        npm,
        nama,
        tempatLahir,
        tanggalLahir,
        tahunMasuk,
        fakultasId: fakultas.id,
        programStudiId: prodi.id,
        tanggalLulus: tanggalLulusStr ? new Date(tanggalLulusStr) : null,
        judulSkripsi: cellToString(getValue("judulSkripsi")) || null,
        konsentrasi: cellToString(getValue("konsentrasi")) || null,
        noIjazah: cellToString(getValue("noIjazah")) || null,
        noSeri: cellToString(getValue("noSeri")) || null,
        tglSkDekan: tglSkDekanStr ? new Date(tglSkDekanStr) : null,
      };

      const existing = await mahasiswaRepository.findByNpm(npm);
      if (existing) {
        await prisma.mahasiswa.update({
          where: { id: existing.id },
          data: { ...writeData, statusCetak: "BELUM_CETAK" },
        });
      } else {
        await prisma.mahasiswa.create({ data: { ...writeData, statusCetak: "BELUM_CETAK" } });
      }

      successCount += 1;
    } catch (error) {
      failures.push({
        row: rowNumber,
        npm: npm || "-",
        message: error instanceof Error ? error.message : "Baris gagal diproses",
      });
    }
  }

  return { totalRows, successCount, failures };
}
