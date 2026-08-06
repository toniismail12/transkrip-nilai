import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { parseIdParam } from "@/lib/api/params";
import { toggleUserActiveSchema } from "@/validators/user.validator";
import { toggleUserActive } from "@/services/user.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const { isActive } = toggleUserActiveSchema.parse(body);
    const user = await toggleUserActive(parseIdParam(id), isActive, {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(user, isActive ? "User berhasil diaktifkan" : "User berhasil dinonaktifkan");
  } catch (error) {
    return handleApiError(error);
  }
}
