import { akreditasiRepository } from "@/repositories/akreditasi.repository";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { ACTIVITY_ACTIONS, logActivity } from "@/services/activity-log.service";
import type { AkreditasiFormInput, AkreditasiQuery } from "@/validators/akreditasi.validator";

interface Actor {
  id: number;
  name: string;
}

export async function listAkreditasi(query: AkreditasiQuery) {
  const { data, total } = await akreditasiRepository.findMany(query);
  return { data, total, page: query.page, pageSize: query.pageSize };
}

export async function getAkreditasiById(id: number) {
  const akreditasi = await akreditasiRepository.findById(id);
  if (!akreditasi) {
    throw new NotFoundError("Akreditasi tidak ditemukan");
  }
  return akreditasi;
}

export async function createAkreditasi(input: AkreditasiFormInput, actor: Actor) {
  const akreditasi = await akreditasiRepository.create({
    nama: input.nama,
    keterangan: input.keterangan || null,
  });

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.CREATE_AKREDITASI,
    entityType: "Akreditasi",
    entityId: akreditasi.id,
    description: `Menambah akreditasi "${akreditasi.nama}"`,
  });

  return akreditasi;
}

export async function updateAkreditasi(id: number, input: AkreditasiFormInput, actor: Actor) {
  await getAkreditasiById(id);

  const updated = await akreditasiRepository.update(id, {
    nama: input.nama,
    keterangan: input.keterangan || null,
  });

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.UPDATE_AKREDITASI,
    entityType: "Akreditasi",
    entityId: updated.id,
    description: `Memperbarui akreditasi "${updated.nama}"`,
  });

  return updated;
}

export async function deleteAkreditasi(id: number, actor: Actor) {
  const akreditasi = await getAkreditasiById(id);

  if (akreditasi.isActive) {
    throw new ConflictError(
      "Akreditasi yang sedang aktif tidak dapat dihapus, aktifkan akreditasi lain terlebih dahulu",
    );
  }

  await akreditasiRepository.softDelete(id);

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.DELETE_AKREDITASI,
    entityType: "Akreditasi",
    entityId: id,
    description: `Menghapus akreditasi "${akreditasi.nama}"`,
  });
}

export async function activateAkreditasi(id: number, actor: Actor) {
  await getAkreditasiById(id);

  const [, activated] = await akreditasiRepository.activateTransaction(id);

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.ACTIVATE_AKREDITASI,
    entityType: "Akreditasi",
    entityId: activated.id,
    description: `Mengaktifkan akreditasi "${activated.nama}"`,
  });

  return activated;
}
