import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { parseIdParam } from "@/lib/api/params";
import { akreditasiFormSchema } from "@/validators/akreditasi.validator";
import {
  deleteAkreditasi,
  getAkreditasiById,
  updateAkreditasi,
} from "@/services/akreditasi.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireUser();
    const { id } = await params;
    const akreditasi = await getAkreditasiById(parseIdParam(id));
    return apiSuccess(akreditasi);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const input = akreditasiFormSchema.parse(body);
    const akreditasi = await updateAkreditasi(parseIdParam(id), input, {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(akreditasi, "Akreditasi berhasil diperbarui");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await requireUser();
    const { id } = await params;
    await deleteAkreditasi(parseIdParam(id), {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(null, "Akreditasi berhasil dihapus");
  } catch (error) {
    return handleApiError(error);
  }
}
