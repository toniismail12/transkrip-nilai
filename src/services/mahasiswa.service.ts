import { prisma } from "@/lib/prisma";
import { mahasiswaRepository, type MahasiswaWriteData } from "@/repositories/mahasiswa.repository";
import { fakultasRepository } from "@/repositories/fakultas.repository";
import { BadRequestError, ConflictError, NotFoundError } from "@/lib/errors";
import { ACTIVITY_ACTIONS, logActivity } from "@/services/activity-log.service";
import type { MahasiswaFormOutput, MahasiswaQuery } from "@/validators/mahasiswa.validator";

interface Actor {
  id: number;
  name: string;
}

function toDateOrNull(value: string | undefined) {
  if (!value) return null;
  return new Date(value);
}

function buildWriteData(input: MahasiswaFormOutput): MahasiswaWriteData {
  return {
    npm: input.npm,
    nama: input.nama,
    tempatLahir: input.tempatLahir,
    tanggalLahir: new Date(input.tanggalLahir),
    tahunMasuk: input.tahunMasuk,
    fakultasId: input.fakultasId,
    programStudiId: input.programStudiId,
    tanggalLulus: toDateOrNull(input.tanggalLulus),
    judulSkripsi: input.judulSkripsi || null,
    konsentrasi: input.konsentrasi || null,
    noIjazah: input.noIjazah || null,
    noSeri: input.noSeri || null,
    tglSkDekan: toDateOrNull(input.tglSkDekan),
  };
}

async function assertFakultasProdiValid(fakultasId: number, programStudiId: number) {
  const fakultas = await fakultasRepository.findById(fakultasId);
  if (!fakultas) {
    throw new BadRequestError("Fakultas tidak ditemukan");
  }

  const prodi = await prisma.programStudi.findFirst({
    where: { id: programStudiId, deletedAt: null },
  });
  if (!prodi) {
    throw new BadRequestError("Program studi tidak ditemukan");
  }
  if (prodi.fakultasId !== fakultasId) {
    throw new BadRequestError("Program studi tidak sesuai dengan fakultas yang dipilih");
  }
}

export async function listMahasiswa(query: MahasiswaQuery) {
  const { data, total } = await mahasiswaRepository.findMany(query);
  return { data, total, page: query.page, pageSize: query.pageSize };
}

export async function listMahasiswaForExport(
  query: Pick<MahasiswaQuery, "search" | "fakultasId" | "programStudiId" | "statusCetak">,
) {
  return mahasiswaRepository.findAllForExport(query);
}

export async function getMahasiswaById(id: number) {
  const mahasiswa = await mahasiswaRepository.findById(id);
  if (!mahasiswa) {
    throw new NotFoundError("Mahasiswa tidak ditemukan");
  }
  return mahasiswa;
}

export async function createMahasiswa(input: MahasiswaFormOutput, actor: Actor) {
  const existing = await mahasiswaRepository.findByNpm(input.npm);
  if (existing) {
    throw new ConflictError("NPM sudah terdaftar");
  }

  await assertFakultasProdiValid(input.fakultasId, input.programStudiId);

  const mahasiswa = await mahasiswaRepository.create(buildWriteData(input));

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.CREATE_MAHASISWA,
    entityType: "Mahasiswa",
    entityId: mahasiswa.id,
    description: `Menambah mahasiswa ${mahasiswa.nama} (${mahasiswa.npm})`,
    metadata: { npm: mahasiswa.npm },
  });

  return mahasiswa;
}

export async function updateMahasiswa(id: number, input: MahasiswaFormOutput, actor: Actor) {
  await getMahasiswaById(id);

  const existing = await mahasiswaRepository.findByNpm(input.npm);
  if (existing && existing.id !== id) {
    throw new ConflictError("NPM sudah terdaftar");
  }

  await assertFakultasProdiValid(input.fakultasId, input.programStudiId);

  const updated = await mahasiswaRepository.update(id, buildWriteData(input));

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.UPDATE_MAHASISWA,
    entityType: "Mahasiswa",
    entityId: updated.id,
    description: `Memperbarui mahasiswa ${updated.nama} (${updated.npm})`,
  });

  return updated;
}

export async function deleteMahasiswa(id: number, actor: Actor) {
  const mahasiswa = await getMahasiswaById(id);

  const transkripCount = await mahasiswaRepository.countRelatedTranskrip(id);
  if (transkripCount > 0) {
    throw new ConflictError("Mahasiswa tidak dapat dihapus karena memiliki riwayat transkrip");
  }

  await mahasiswaRepository.softDelete(id);

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.DELETE_MAHASISWA,
    entityType: "Mahasiswa",
    entityId: id,
    description: `Menghapus mahasiswa ${mahasiswa.nama} (${mahasiswa.npm})`,
  });
}
