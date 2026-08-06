import { prisma } from "@/lib/prisma";
import type { InputJsonValue } from "@prisma/client/runtime/client";

export interface TranskripQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortOrder: "asc" | "desc";
}

export interface TranskripCreateData {
  mahasiswaId: number;
  npmSnapshot: string;
  namaSnapshot: string;
  cetakOlehId: number | null;
  cetakOlehNamaSnapshot: string;
  noSeri: string | null;
  ipk: number;
  totalSks: number;
  totalBobotNilai: number;
  predikat: string;
  judulSkripsiSnapshot: string | null;
  biodataSnapshot: InputJsonValue;
  mataKuliahSnapshot: InputJsonValue;
  scrapedAt: Date;
}

export const transkripRepository = {
  async findMany(query: TranskripQuery) {
    const where = {
      status: "GENERATED" as const,
      ...(query.search
        ? {
            OR: [
              { npmSnapshot: { contains: query.search, mode: "insensitive" as const } },
              { namaSnapshot: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.transkrip.findMany({
        where,
        orderBy: { tanggalCetak: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.transkrip.count({ where }),
    ]);

    return { data, total };
  },

  findById(id: number) {
    return prisma.transkrip.findUnique({ where: { id } });
  },

  findLatestByMahasiswaId(mahasiswaId: number) {
    return prisma.transkrip.findFirst({
      where: { mahasiswaId, status: "GENERATED" },
      orderBy: { tanggalCetak: "desc" },
    });
  },

  create(data: TranskripCreateData) {
    return prisma.transkrip.create({ data });
  },

  async createAndMarkPrinted(data: TranskripCreateData) {
    const [transkrip] = await prisma.$transaction([
      prisma.transkrip.create({ data }),
      prisma.mahasiswa.update({
        where: { id: data.mahasiswaId },
        data: { statusCetak: "SUDAH_CETAK", noSeri: data.noSeri },
      }),
    ]);
    return transkrip;
  },

  void(id: number, reason: string) {
    return prisma.transkrip.update({
      where: { id },
      data: { status: "VOID", voidedAt: new Date(), voidReason: reason },
    });
  },
};
