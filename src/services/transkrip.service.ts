import { prisma } from "@/lib/prisma";
import { transkripRepository, type TranskripQuery } from "@/repositories/transkrip.repository";
import { nilaiRepository, type ScrapedCourseRow } from "@/repositories/nilai.repository";
import { akreditasiRepository } from "@/repositories/akreditasi.repository";
import { computePredikat } from "@/services/predikat.service";
import { formatDateIndonesian, formatProgramPendidikan } from "@/lib/format";
import { BadRequestError, ConflictError, NotFoundError } from "@/lib/errors";
import { ACTIVITY_ACTIONS, logActivity } from "@/services/activity-log.service";
import type { InputJsonValue } from "@prisma/client/runtime/client";

export interface TranskripBiodata {
  nama: string;
  tempatTanggalLahir: string;
  npm: string;
  programPendidikan: string;
  fakultas: string;
  programStudi: string;
  konsentrasi: string | null;
  tanggalLulus: string | null;
  noIjazah: string | null;
}

interface TranskripBiodataSnapshot extends TranskripBiodata {
  akreditasiLabel: string;
  dekanNama: string;
  tanggalSuratKeputusan: string | null;
}

export interface TranskripPdfData {
  noSeri: string | null;
  biodata: TranskripBiodataSnapshot;
  courses: ScrapedCourseRow[];
  totalSks: number;
  totalBobotNilai: number;
  ipk: number;
  predikat: string;
  judulSkripsi: string | null;
}

async function findMahasiswaByNpmOrThrow(npm: string) {
  const mahasiswa = await prisma.mahasiswa.findFirst({
    where: { npm, deletedAt: null },
    include: { fakultas: true, programStudi: true },
  });
  if (!mahasiswa) {
    throw new NotFoundError(`Mahasiswa dengan NPM ${npm} tidak ditemukan`);
  }
  return mahasiswa;
}

function buildBiodata(
  mahasiswa: Awaited<ReturnType<typeof findMahasiswaByNpmOrThrow>>,
): TranskripBiodata {
  return {
    nama: mahasiswa.nama,
    tempatTanggalLahir: `${mahasiswa.tempatLahir}, ${formatDateIndonesian(mahasiswa.tanggalLahir)}`,
    npm: mahasiswa.npm,
    programPendidikan: formatProgramPendidikan(mahasiswa.programStudi.jenjang),
    fakultas: mahasiswa.fakultas.nama,
    programStudi: mahasiswa.programStudi.nama,
    konsentrasi: mahasiswa.konsentrasi,
    tanggalLulus: formatDateIndonesian(mahasiswa.tanggalLulus),
    noIjazah: mahasiswa.noIjazah,
  };
}

export async function previewTranskrip(npm: string): Promise<TranskripPdfData> {
  const mahasiswa = await findMahasiswaByNpmOrThrow(npm);
  const [scraped, akreditasiAktif] = await Promise.all([
    nilaiRepository.getByNim(npm),
    akreditasiRepository.findActive(),
  ]);

  const predikat = await computePredikat(scraped.ipk);

  return {
    noSeri: mahasiswa.noSeri,
    biodata: {
      ...buildBiodata(mahasiswa),
      akreditasiLabel: akreditasiAktif?.nama ?? "-",
      dekanNama: mahasiswa.fakultas.dekan,
      tanggalSuratKeputusan: formatDateIndonesian(mahasiswa.tglSkDekan),
    },
    courses: scraped.courses,
    // Legacy scrape naming is inverted relative to intent: `totalSksSemester` is actually
    // the weighted-points sum (jumlah AM×K) and `totalSksBernilai` is the credited SKS total.
    totalSks: scraped.totalSksBernilai,
    totalBobotNilai: scraped.totalSksSemester,
    ipk: scraped.ipk,
    predikat,
    judulSkripsi: mahasiswa.judulSkripsi,
  };
}

interface GenerateTranskripInput {
  npm: string;
  noSeri?: string;
  userId: number;
  userName: string;
}

export async function generateTranskrip({ npm, noSeri, userId, userName }: GenerateTranskripInput) {
  const mahasiswa = await findMahasiswaByNpmOrThrow(npm);
  const [scraped, akreditasiAktif] = await Promise.all([
    nilaiRepository.getByNim(npm),
    akreditasiRepository.findActive(),
  ]);

  const predikat = await computePredikat(scraped.ipk);
  const biodata = buildBiodata(mahasiswa);
  const finalNoSeri = noSeri || mahasiswa.noSeri || null;

  const transkrip = await transkripRepository.createAndMarkPrinted({
    mahasiswaId: mahasiswa.id,
    npmSnapshot: mahasiswa.npm,
    namaSnapshot: mahasiswa.nama,
    cetakOlehId: userId,
    cetakOlehNamaSnapshot: userName,
    noSeri: finalNoSeri,
    ipk: scraped.ipk,
    totalSks: scraped.totalSksBernilai,
    totalBobotNilai: scraped.totalSksSemester,
    predikat,
    judulSkripsiSnapshot: mahasiswa.judulSkripsi,
    biodataSnapshot: {
      ...biodata,
      akreditasiLabel: akreditasiAktif?.nama ?? "-",
      dekanNama: mahasiswa.fakultas.dekan,
      tanggalSuratKeputusan: formatDateIndonesian(mahasiswa.tglSkDekan),
    },
    mataKuliahSnapshot: scraped.courses as unknown as InputJsonValue,
    scrapedAt: scraped.scrapedAt,
  });

  await logActivity({
    userId,
    userNama: userName,
    action: ACTIVITY_ACTIONS.GENERATE_TRANSKRIP,
    entityType: "Transkrip",
    entityId: transkrip.id,
    description: `Mencetak transkrip ${mahasiswa.nama} (${mahasiswa.npm})`,
    metadata: { npm: mahasiswa.npm, ipk: scraped.ipk, predikat },
  });

  return transkrip;
}

export type TranskripListItem = Omit<
  Awaited<ReturnType<typeof transkripRepository.findMany>>["data"][number],
  "ipk" | "totalBobotNilai"
> & {
  ipk: number;
  totalBobotNilai: number;
};

export async function listTranskrip(query: TranskripQuery) {
  const { data, total } = await transkripRepository.findMany(query);
  // Prisma's Decimal is a class instance, not a plain object — it cannot cross the
  // Server -> Client Component prop boundary, so it must be converted to `number` here.
  const serialized: TranskripListItem[] = data.map((row) => ({
    ...row,
    ipk: Number(row.ipk),
    totalBobotNilai: Number(row.totalBobotNilai),
  }));
  return { data: serialized, total, page: query.page, pageSize: query.pageSize };
}

export async function getTranskripById(id: number) {
  const transkrip = await transkripRepository.findById(id);
  if (!transkrip) {
    throw new NotFoundError("Transkrip tidak ditemukan");
  }
  return transkrip;
}

export async function getTranskripPdfData(id: number): Promise<TranskripPdfData> {
  const transkrip = await getTranskripById(id);
  const biodata = transkrip.biodataSnapshot as unknown as TranskripBiodataSnapshot;

  return {
    noSeri: transkrip.noSeri,
    biodata,
    courses: transkrip.mataKuliahSnapshot as unknown as ScrapedCourseRow[],
    totalSks: transkrip.totalSks,
    totalBobotNilai: Number(transkrip.totalBobotNilai),
    ipk: Number(transkrip.ipk),
    predikat: transkrip.predikat,
    judulSkripsi: transkrip.judulSkripsiSnapshot,
  };
}

export async function voidTranskrip(
  id: number,
  reason: string,
  actor?: { id: number; name: string },
) {
  const transkrip = await getTranskripById(id);
  if (transkrip.status === "VOID") {
    throw new ConflictError("Transkrip ini sudah dibatalkan sebelumnya");
  }
  if (!reason.trim()) {
    throw new BadRequestError("Alasan pembatalan wajib diisi");
  }

  const voided = await transkripRepository.void(id, reason);

  await logActivity({
    userId: actor?.id ?? null,
    userNama: actor?.name ?? null,
    action: ACTIVITY_ACTIONS.VOID_TRANSKRIP,
    entityType: "Transkrip",
    entityId: id,
    description: `Membatalkan transkrip ${transkrip.namaSnapshot} (${transkrip.npmSnapshot})`,
    metadata: { reason },
  });

  return voided;
}
