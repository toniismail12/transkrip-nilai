import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { parseIdParam } from "@/lib/api/params";
import { userUpdateSchema } from "@/validators/user.validator";
import { deleteUser, getUserById, updateUser } from "@/services/user.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;
    const user = await getUserById(parseIdParam(id));
    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const input = userUpdateSchema.parse(body);
    const user = await updateUser(parseIdParam(id), input, {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(user, "User berhasil diperbarui");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await requireRole(["ADMIN"]);
    const { id } = await params;
    await deleteUser(parseIdParam(id), {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(null, "User berhasil dihapus");
  } catch (error) {
    return handleApiError(error);
  }
}
