import { prisma } from "@/lib/prisma";
import { userRepository } from "@/repositories/user.repository";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { ACTIVITY_ACTIONS, logActivity } from "@/services/activity-log.service";
import type { ProfileFormOutput } from "@/validators/profile.validator";

export async function updateOwnProfile(userId: number, input: ProfileFormOutput) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError("User tidak ditemukan");
  }

  const email = input.email || null;
  if (email) {
    const existing = await prisma.user.findFirst({
      where: { email, deletedAt: null, id: { not: userId } },
    });
    if (existing) {
      throw new ConflictError("Email sudah digunakan oleh user lain");
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { name: input.name, email },
  });

  await logActivity({
    userId: updated.id,
    userNama: updated.name,
    action: ACTIVITY_ACTIONS.UPDATE_PROFILE,
    entityType: "User",
    entityId: updated.id,
    description: `${updated.name} memperbarui profil`,
  });

  return {
    id: updated.id,
    username: updated.username,
    name: updated.name,
    email: updated.email,
    role: updated.role,
  };
}
