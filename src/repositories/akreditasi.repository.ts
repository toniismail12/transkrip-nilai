import { prisma } from "@/lib/prisma";
import type { AkreditasiQuery } from "@/validators/akreditasi.validator";

interface AkreditasiWriteData {
  nama: string;
  keterangan: string | null;
}

export const akreditasiRepository = {
  async findMany(query: AkreditasiQuery) {
    const where = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { nama: { contains: query.search, mode: "insensitive" as const } },
              { keterangan: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.akreditasi.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.akreditasi.count({ where }),
    ]);

    return { data, total };
  },

  findById(id: number) {
    return prisma.akreditasi.findFirst({ where: { id, deletedAt: null } });
  },

  findActive() {
    return prisma.akreditasi.findFirst({ where: { isActive: true, deletedAt: null } });
  },

  create(data: AkreditasiWriteData) {
    return prisma.akreditasi.create({ data });
  },

  update(id: number, data: AkreditasiWriteData) {
    return prisma.akreditasi.update({ where: { id }, data });
  },

  softDelete(id: number) {
    return prisma.akreditasi.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  activateTransaction(id: number) {
    return prisma.$transaction([
      prisma.akreditasi.updateMany({ where: { isActive: true }, data: { isActive: false } }),
      prisma.akreditasi.update({ where: { id }, data: { isActive: true } }),
    ]);
  },
};
