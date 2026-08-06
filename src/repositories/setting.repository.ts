import { prisma } from "@/lib/prisma";
import type { InputJsonValue } from "@prisma/client/runtime/client";

export const settingRepository = {
  findAll() {
    return prisma.setting.findMany({ orderBy: { key: "asc" } });
  },

  findByKey(key: string) {
    return prisma.setting.findUnique({ where: { key } });
  },

  upsert(key: string, value: InputJsonValue, description?: string) {
    return prisma.setting.upsert({
      where: { key },
      update: { value, ...(description ? { description } : {}) },
      create: { key, value, description },
    });
  },
};
