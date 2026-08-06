import { userRepository } from "@/repositories/user.repository";
import { comparePassword, hashPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/jwt";
import { UnauthorizedError, ForbiddenError, BadRequestError } from "@/lib/errors";
import { ACTIVITY_ACTIONS, logActivity } from "@/services/activity-log.service";
import type { LoginInput, ChangePasswordInput } from "@/validators/auth.validator";

export async function login(input: LoginInput) {
  const user = await userRepository.findByUsername(input.username);
  if (!user) {
    throw new UnauthorizedError("Username atau password salah");
  }

  const isPasswordValid = await comparePassword(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Username atau password salah");
  }

  if (!user.isActive) {
    throw new ForbiddenError("Akun tidak aktif, hubungi administrator");
  }

  await userRepository.touchLastLogin(user.id);
  await logActivity({
    userId: user.id,
    userNama: user.name,
    action: ACTIVITY_ACTIONS.LOGIN,
    entityType: "User",
    entityId: user.id,
    description: `${user.name} masuk ke sistem`,
  });

  const expiresIn = input.rememberMe ? "30d" : "8h";
  const token = await signSession(
    { sub: String(user.id), username: user.username, role: user.role },
    expiresIn,
  );

  return {
    token,
    expiresIn,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
  };
}

export async function changePassword(userId: number, input: ChangePasswordInput) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new UnauthorizedError();
  }

  const isCurrentValid = await comparePassword(input.currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    throw new BadRequestError("Password saat ini salah");
  }

  const newHash = await hashPassword(input.newPassword);
  await userRepository.updatePassword(userId, newHash);

  await logActivity({
    userId: user.id,
    userNama: user.name,
    action: ACTIVITY_ACTIONS.CHANGE_PASSWORD,
    entityType: "User",
    entityId: user.id,
    description: `${user.name} mengubah password`,
  });
}
