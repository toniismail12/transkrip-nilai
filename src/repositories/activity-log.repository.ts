import { prisma } from "@/lib/prisma";
import type { InputJsonValue } from "@prisma/client/runtime/client";

export interface ActivityLogCreateData {
  userId: number | null;
  userNama: string | null;
  action: string;
  entityType: string | null;
  entityId: number | null;
  description: string;
  metadata?: InputJsonValue;
}

export const activityLogRepository = {
  create(data: ActivityLogCreateData) {
    return prisma.activityLog.create({ data });
  },

  findRecent(limit: number) {
    return prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
};
