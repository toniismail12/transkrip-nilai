import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { changePasswordSchema } from "@/validators/auth.validator";
import { changePassword } from "@/services/auth.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const input = changePasswordSchema.parse(body);
    await changePassword(user.id, input);
    return apiSuccess(null, "Password berhasil diubah");
  } catch (error) {
    return handleApiError(error);
  }
}
