import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { parseIdParam } from "@/lib/api/params";
import { activateAkreditasi } from "@/services/akreditasi.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await requireUser();
    const { id } = await params;
    const akreditasi = await activateAkreditasi(parseIdParam(id), {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(akreditasi, "Akreditasi berhasil diaktifkan");
  } catch (error) {
    return handleApiError(error);
  }
}
