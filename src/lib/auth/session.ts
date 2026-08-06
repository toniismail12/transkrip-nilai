import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { Role } from "@/types/auth";
import { verifySession } from "./jwt";

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "transkrip_session";

async function getSessionPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const payload = await getSessionPayload();
  if (!payload) return null;

  const userId = Number(payload.sub);
  if (Number.isNaN(userId)) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive || user.deletedAt) return null;

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role as Role)) {
    throw new ForbiddenError();
  }
  return user;
}
