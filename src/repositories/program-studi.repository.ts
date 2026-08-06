import { prisma } from "@/lib/prisma";
import type { JenjangPendidikan } from "@/generated/prisma/client";
import type { ProgramStudiQuery } from "@/validators/program-studi.validator";

interface ProgramStudiWriteData {
  fakultasId: number;
  nama: string;
  kode: string | null;
  jenjang: JenjangPendidikan;
}

export const programStudiRepository = {
  async findMany(query: ProgramStudiQuery) {
    const where = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { nama: { contains: query.search, mode: "insensitive" as const } },
              { kode: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.programStudi.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          fakultas: { select: { id: true, nama: true } },
          _count: { select: { mahasiswaList: true } },
        },
      }),
      prisma.programStudi.count({ where }),
    ]);

    return { data, total };
  },

  findById(id: number) {
    return prisma.programStudi.findFirst({
      where: { id, deletedAt: null },
      include: { fakultas: { select: { id: true, nama: true } } },
    });
  },

  findByNamaInFakultas(fakultasId: number, nama: string) {
    return prisma.programStudi.findFirst({ where: { fakultasId, nama, deletedAt: null } });
  },

  findAllActive() {
    return prisma.programStudi.findMany({ where: { deletedAt: null }, orderBy: { nama: "asc" } });
  },

  create(data: ProgramStudiWriteData) {
    return prisma.programStudi.create({ data });
  },

  update(id: number, data: ProgramStudiWriteData) {
    return prisma.programStudi.update({ where: { id }, data });
  },

  countRelatedMahasiswa(id: number) {
    return prisma.mahasiswa.count({ where: { programStudiId: id, deletedAt: null } });
  },

  softDelete(id: number) {
    return prisma.programStudi.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
