import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { profileFormSchema } from "@/validators/profile.validator";
import { updateOwnProfile } from "@/services/profile.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const input = profileFormSchema.parse(body);
    const updated = await updateOwnProfile(user.id, input);
    return apiSuccess(updated, "Profil berhasil diperbarui");
  } catch (error) {
    return handleApiError(error);
  }
}
