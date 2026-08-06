import { programStudiRepository } from "@/repositories/program-studi.repository";
import { fakultasRepository } from "@/repositories/fakultas.repository";
import { BadRequestError, ConflictError, NotFoundError } from "@/lib/errors";
import { ACTIVITY_ACTIONS, logActivity } from "@/services/activity-log.service";
import type {
  ProgramStudiFormOutput,
  ProgramStudiQuery,
} from "@/validators/program-studi.validator";

interface Actor {
  id: number;
  name: string;
}

export async function listProgramStudi(query: ProgramStudiQuery) {
  const { data, total } = await programStudiRepository.findMany(query);
  return { data, total, page: query.page, pageSize: query.pageSize };
}

export async function getProgramStudiById(id: number) {
  const programStudi = await programStudiRepository.findById(id);
  if (!programStudi) {
    throw new NotFoundError("Program studi tidak ditemukan");
  }
  return programStudi;
}

export async function listAllActiveProgramStudi() {
  return programStudiRepository.findAllActive();
}

export async function createProgramStudi(input: ProgramStudiFormOutput, actor: Actor) {
  const fakultas = await fakultasRepository.findById(input.fakultasId);
  if (!fakultas) {
    throw new BadRequestError("Fakultas tidak ditemukan");
  }

  const existing = await programStudiRepository.findByNamaInFakultas(input.fakultasId, input.nama);
  if (existing) {
    throw new ConflictError("Nama program studi sudah terdaftar di fakultas ini");
  }

  const programStudi = await programStudiRepository.create({
    fakultasId: input.fakultasId,
    nama: input.nama,
    kode: input.kode || null,
    jenjang: input.jenjang,
  });

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.CREATE_PROGRAM_STUDI,
    entityType: "ProgramStudi",
    entityId: programStudi.id,
    description: `Menambah program studi "${programStudi.nama}"`,
  });

  return programStudi;
}

export async function updateProgramStudi(id: number, input: ProgramStudiFormOutput, actor: Actor) {
  await getProgramStudiById(id);

  const fakultas = await fakultasRepository.findById(input.fakultasId);
  if (!fakultas) {
    throw new BadRequestError("Fakultas tidak ditemukan");
  }

  const existing = await programStudiRepository.findByNamaInFakultas(input.fakultasId, input.nama);
  if (existing && existing.id !== id) {
    throw new ConflictError("Nama program studi sudah terdaftar di fakultas ini");
  }

  const updated = await programStudiRepository.update(id, {
    fakultasId: input.fakultasId,
    nama: input.nama,
    kode: input.kode || null,
    jenjang: input.jenjang,
  });

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.UPDATE_PROGRAM_STUDI,
    entityType: "ProgramStudi",
    entityId: updated.id,
    description: `Memperbarui program studi "${updated.nama}"`,
  });

  return updated;
}

export async function deleteProgramStudi(id: number, actor: Actor) {
  const programStudi = await getProgramStudiById(id);

  const mahasiswaCount = await programStudiRepository.countRelatedMahasiswa(id);
  if (mahasiswaCount > 0) {
    throw new ConflictError(
      "Program studi tidak dapat dihapus karena masih memiliki mahasiswa terkait",
    );
  }

  await programStudiRepository.softDelete(id);

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.DELETE_PROGRAM_STUDI,
    entityType: "ProgramStudi",
    entityId: id,
    description: `Menghapus program studi "${programStudi.nama}"`,
  });
}
