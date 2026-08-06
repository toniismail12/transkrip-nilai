import { prisma } from "@/lib/prisma";
import type { MahasiswaQuery } from "@/validators/mahasiswa.validator";

export interface MahasiswaWriteData {
  npm: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: Date;
  tahunMasuk: number;
  fakultasId: number;
  programStudiId: number;
  tanggalLulus: Date | null;
  judulSkripsi: string | null;
  konsentrasi: string | null;
  noIjazah: string | null;
  noSeri: string | null;
  tglSkDekan: Date | null;
}

function buildWhere(
  query: Pick<MahasiswaQuery, "search" | "fakultasId" | "programStudiId" | "statusCetak">,
) {
  return {
    deletedAt: null,
    ...(query.fakultasId ? { fakultasId: query.fakultasId } : {}),
    ...(query.programStudiId ? { programStudiId: query.programStudiId } : {}),
    ...(query.statusCetak ? { statusCetak: query.statusCetak } : {}),
    ...(query.search
      ? {
          OR: [
            { npm: { contains: query.search, mode: "insensitive" as const } },
            { nama: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export const mahasiswaRepository = {
  async findMany(query: MahasiswaQuery) {
    const where = buildWhere(query);

    const [data, total] = await Promise.all([
      prisma.mahasiswa.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          fakultas: { select: { id: true, nama: true } },
          programStudi: { select: { id: true, nama: true } },
        },
      }),
      prisma.mahasiswa.count({ where }),
    ]);

    return { data, total };
  },

  findAllForExport(
    query: Pick<MahasiswaQuery, "search" | "fakultasId" | "programStudiId" | "statusCetak">,
  ) {
    return prisma.mahasiswa.findMany({
      where: buildWhere(query),
      orderBy: { nama: "asc" },
      include: {
        fakultas: { select: { id: true, nama: true } },
        programStudi: { select: { id: true, nama: true } },
      },
    });
  },

  findById(id: number) {
    return prisma.mahasiswa.findFirst({
      where: { id, deletedAt: null },
      include: {
        fakultas: { select: { id: true, nama: true, dekan: true } },
        programStudi: { select: { id: true, nama: true, jenjang: true } },
      },
    });
  },

  findByNpm(npm: string) {
    return prisma.mahasiswa.findFirst({ where: { npm, deletedAt: null } });
  },

  create(data: MahasiswaWriteData) {
    return prisma.mahasiswa.create({ data });
  },

  update(id: number, data: MahasiswaWriteData) {
    return prisma.mahasiswa.update({ where: { id }, data });
  },

  countRelatedTranskrip(id: number) {
    return prisma.transkrip.count({ where: { mahasiswaId: id } });
  },

  softDelete(id: number) {
    return prisma.mahasiswa.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
