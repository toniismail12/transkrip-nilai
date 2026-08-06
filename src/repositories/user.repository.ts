import { prisma } from "@/lib/prisma";
import type { UserQuery } from "@/validators/user.validator";

export interface UserWriteData {
  username: string;
  name: string;
  email: string | null;
  role: "ADMIN" | "OPERATOR";
}

function buildWhere(query: Pick<UserQuery, "search" | "role">) {
  return {
    deletedAt: null,
    ...(query.role ? { role: query.role } : {}),
    ...(query.search
      ? {
          OR: [
            { username: { contains: query.search, mode: "insensitive" as const } },
            { name: { contains: query.search, mode: "insensitive" as const } },
            { email: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export const userRepository = {
  findByUsername(username: string) {
    return prisma.user.findFirst({ where: { username, deletedAt: null } });
  },

  findById(id: number) {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  },

  findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  },

  touchLastLogin(id: number) {
    return prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  },

  updatePassword(id: number, passwordHash: string) {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  async findMany(query: UserQuery) {
    const where = buildWhere(query);

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  },

  countAll() {
    return prisma.user.count({ where: { deletedAt: null } });
  },

  countActiveAdmins() {
    return prisma.user.count({ where: { role: "ADMIN", isActive: true, deletedAt: null } });
  },

  create(data: UserWriteData & { passwordHash: string }) {
    return prisma.user.create({ data });
  },

  update(id: number, data: UserWriteData & { passwordHash: string }) {
    return prisma.user.update({ where: { id }, data });
  },

  toggleActive(id: number, isActive: boolean) {
    return prisma.user.update({ where: { id }, data: { isActive } });
  },

  softDelete(id: number) {
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  countRelatedTranskrip(id: number) {
    return prisma.transkrip.count({ where: { cetakOlehId: id } });
  },
};
