import { fakultasRepository } from "@/repositories/fakultas.repository";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { ACTIVITY_ACTIONS, logActivity } from "@/services/activity-log.service";
import type { FakultasFormInput, FakultasQuery } from "@/validators/fakultas.validator";

interface Actor {
  id: number;
  name: string;
}

export async function listFakultas(query: FakultasQuery) {
  const { data, total } = await fakultasRepository.findMany(query);
  return { data, total, page: query.page, pageSize: query.pageSize };
}

export async function getFakultasById(id: number) {
  const fakultas = await fakultasRepository.findById(id);
  if (!fakultas) {
    throw new NotFoundError("Fakultas tidak ditemukan");
  }
  return fakultas;
}

export async function listAllActiveFakultas() {
  return fakultasRepository.findAllActive();
}

export async function createFakultas(input: FakultasFormInput, actor: Actor) {
  const existing = await fakultasRepository.findByNama(input.nama);
  if (existing) {
    throw new ConflictError("Nama fakultas sudah terdaftar");
  }

  const fakultas = await fakultasRepository.create({
    nama: input.nama,
    kode: input.kode || null,
    dekan: input.dekan,
  });

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.CREATE_FAKULTAS,
    entityType: "Fakultas",
    entityId: fakultas.id,
    description: `Menambah fakultas "${fakultas.nama}"`,
  });

  return fakultas;
}

export async function updateFakultas(id: number, input: FakultasFormInput, actor: Actor) {
  await getFakultasById(id);

  const existing = await fakultasRepository.findByNama(input.nama);
  if (existing && existing.id !== id) {
    throw new ConflictError("Nama fakultas sudah terdaftar");
  }

  const updated = await fakultasRepository.update(id, {
    nama: input.nama,
    kode: input.kode || null,
    dekan: input.dekan,
  });

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.UPDATE_FAKULTAS,
    entityType: "Fakultas",
    entityId: updated.id,
    description: `Memperbarui fakultas "${updated.nama}"`,
  });

  return updated;
}

export async function deleteFakultas(id: number, actor: Actor) {
  const fakultas = await getFakultasById(id);

  const [prodiCount, mahasiswaCount] = await fakultasRepository.countRelated(id);
  if (prodiCount > 0 || mahasiswaCount > 0) {
    throw new ConflictError(
      "Fakultas tidak dapat dihapus karena masih memiliki program studi atau mahasiswa terkait",
    );
  }

  await fakultasRepository.softDelete(id);

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.DELETE_FAKULTAS,
    entityType: "Fakultas",
    entityId: id,
    description: `Menghapus fakultas "${fakultas.nama}"`,
  });
}
