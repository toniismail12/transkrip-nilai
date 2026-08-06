import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { userCreateSchema, userQuerySchema } from "@/validators/user.validator";
import { createUser, listUsers } from "@/services/user.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const query = userQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await listUsers(query);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireRole(["ADMIN"]);
    const body = await request.json();
    const input = userCreateSchema.parse(body);
    const user = await createUser(input, {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(user, "User berhasil ditambahkan", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
