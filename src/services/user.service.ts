import { userRepository } from "@/repositories/user.repository";
import { hashPassword } from "@/lib/auth/password";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { ACTIVITY_ACTIONS, logActivity } from "@/services/activity-log.service";
import type { UserCreateOutput, UserQuery, UserUpdateOutput } from "@/validators/user.validator";
import type { User } from "@/generated/prisma/client";

export type SafeUser = Omit<User, "passwordHash">;

interface Actor {
  id: number;
  name: string;
}

/**
 * Strips the bcrypt hash before a user row leaves the service layer — these objects
 * cross the Server -> Client Component boundary, so the hash must never ride along.
 */
function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  };
}

async function getUserRecord(id: number) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new NotFoundError("User tidak ditemukan");
  }
  return user;
}

export async function listUsers(query: UserQuery) {
  const { data, total } = await userRepository.findMany(query);
  return {
    data: data.map(toSafeUser),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getUserById(id: number) {
  const user = await getUserRecord(id);
  return toSafeUser(user);
}

export async function createUser(input: UserCreateOutput, actor: Actor) {
  const existingUsername = await userRepository.findByUsername(input.username);
  if (existingUsername) {
    throw new ConflictError("Username sudah terdaftar");
  }

  if (input.email) {
    const existingEmail = await userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictError("Email sudah terdaftar");
    }
  }

  const passwordHash = await hashPassword(input.password);

  const created = await userRepository.create({
    username: input.username,
    name: input.name,
    email: input.email || null,
    role: input.role,
    passwordHash,
  });

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.CREATE_USER,
    entityType: "User",
    entityId: created.id,
    description: `Menambah user ${created.name} (${created.username})`,
  });

  return toSafeUser(created);
}

export async function updateUser(id: number, input: UserUpdateOutput, actor: Actor) {
  const existing = await getUserRecord(id);

  const existingUsername = await userRepository.findByUsername(input.username);
  if (existingUsername && existingUsername.id !== id) {
    throw new ConflictError("Username sudah terdaftar");
  }

  if (input.email) {
    const existingEmail = await userRepository.findByEmail(input.email);
    if (existingEmail && existingEmail.id !== id) {
      throw new ConflictError("Email sudah terdaftar");
    }
  }

  const passwordHash = input.password ? await hashPassword(input.password) : existing.passwordHash;

  const updated = await userRepository.update(id, {
    username: input.username,
    name: input.name,
    email: input.email || null,
    role: input.role,
    passwordHash,
  });

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.UPDATE_USER,
    entityType: "User",
    entityId: updated.id,
    description: `Memperbarui user ${updated.name} (${updated.username})`,
  });

  return toSafeUser(updated);
}

export async function toggleUserActive(id: number, isActive: boolean, actor: Actor) {
  const target = await getUserRecord(id);

  if (!isActive) {
    if (id === actor.id) {
      throw new ConflictError("Anda tidak dapat menonaktifkan akun Anda sendiri");
    }

    // Without this guard an admin could deactivate every other admin and then
    // themselves, leaving the system with no one able to manage users or settings.
    if (target.role === "ADMIN" && target.isActive) {
      const activeAdminCount = await userRepository.countActiveAdmins();
      if (activeAdminCount <= 1) {
        throw new ConflictError("Minimal harus ada satu administrator aktif");
      }
    }
  }

  const updated = await userRepository.toggleActive(id, isActive);

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.TOGGLE_USER_ACTIVE,
    entityType: "User",
    entityId: updated.id,
    description: isActive
      ? `User ${updated.name} diaktifkan`
      : `User ${updated.name} dinonaktifkan`,
  });

  return toSafeUser(updated);
}

export async function deleteUser(id: number, actor: Actor) {
  const target = await getUserRecord(id);

  if (id === actor.id) {
    throw new ConflictError("Anda tidak dapat menghapus akun Anda sendiri");
  }

  if (target.role === "ADMIN" && target.isActive) {
    const activeAdminCount = await userRepository.countActiveAdmins();
    if (activeAdminCount <= 1) {
      throw new ConflictError("Minimal harus ada satu administrator aktif");
    }
  }

  // Note: Transkrip.cetakOlehId has onDelete: SetNull and every transcript already
  // stores cetakOlehNamaSnapshot, so print history stays readable even after this
  // user is soft-deleted. Related transcripts are therefore not a blocking condition.
  await userRepository.softDelete(id);

  await logActivity({
    userId: actor.id,
    userNama: actor.name,
    action: ACTIVITY_ACTIONS.DELETE_USER,
    entityType: "User",
    entityId: id,
    description: `Menghapus user ${target.name} (${target.username})`,
  });
}
