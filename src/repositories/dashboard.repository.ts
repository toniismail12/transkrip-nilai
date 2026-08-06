import { prisma } from "@/lib/prisma";

export const dashboardRepository = {
  countMahasiswa() {
    return prisma.mahasiswa.count({ where: { deletedAt: null } });
  },

  countMahasiswaByStatusCetak() {
    return prisma.mahasiswa.groupBy({
      by: ["statusCetak"],
      where: { deletedAt: null },
      _count: { _all: true },
    });
  },

  countFakultas() {
    return prisma.fakultas.count({ where: { deletedAt: null } });
  },

  countProgramStudi() {
    return prisma.programStudi.count({ where: { deletedAt: null } });
  },

  countAkreditasi() {
    return prisma.akreditasi.count({ where: { deletedAt: null } });
  },

  countTranskrip() {
    return prisma.transkrip.count({ where: { status: "GENERATED" } });
  },

  findRecentTranskrip(limit: number) {
    return prisma.transkrip.findMany({
      where: { status: "GENERATED" },
      orderBy: { tanggalCetak: "desc" },
      take: limit,
    });
  },

  findTranskripSince(since: Date) {
    return prisma.transkrip.findMany({
      where: { status: "GENERATED", tanggalCetak: { gte: since } },
      select: { tanggalCetak: true },
    });
  },
};
