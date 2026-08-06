import { prisma } from "@/lib/prisma";
import type { FakultasQuery } from "@/validators/fakultas.validator";

interface FakultasWriteData {
  nama: string;
  kode: string | null;
  dekan: string;
}

export const fakultasRepository = {
  async findMany(query: FakultasQuery) {
    const where = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { nama: { contains: query.search, mode: "insensitive" as const } },
              { kode: { contains: query.search, mode: "insensitive" as const } },
              { dekan: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.fakultas.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { _count: { select: { programStudiList: true, mahasiswaList: true } } },
      }),
      prisma.fakultas.count({ where }),
    ]);

    return { data, total };
  },

  findById(id: number) {
    return prisma.fakultas.findFirst({ where: { id, deletedAt: null } });
  },

  findByNama(nama: string) {
    return prisma.fakultas.findFirst({ where: { nama, deletedAt: null } });
  },

  findAllActive() {
    return prisma.fakultas.findMany({ where: { deletedAt: null }, orderBy: { nama: "asc" } });
  },

  create(data: FakultasWriteData) {
    return prisma.fakultas.create({ data });
  },

  update(id: number, data: FakultasWriteData) {
    return prisma.fakultas.update({ where: { id }, data });
  },

  countRelated(id: number) {
    return prisma.$transaction([
      prisma.programStudi.count({ where: { fakultasId: id, deletedAt: null } }),
      prisma.mahasiswa.count({ where: { fakultasId: id, deletedAt: null } }),
    ]);
  },

  softDelete(id: number) {
    return prisma.fakultas.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
