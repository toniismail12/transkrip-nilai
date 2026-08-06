import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { parseIdParam } from "@/lib/api/params";
import { fakultasFormSchema } from "@/validators/fakultas.validator";
import { deleteFakultas, getFakultasById, updateFakultas } from "@/services/fakultas.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireUser();
    const { id } = await params;
    const fakultas = await getFakultasById(parseIdParam(id));
    return apiSuccess(fakultas);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const input = fakultasFormSchema.parse(body);
    const fakultas = await updateFakultas(parseIdParam(id), input, {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(fakultas, "Fakultas berhasil diperbarui");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await requireUser();
    const { id } = await params;
    await deleteFakultas(parseIdParam(id), {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(null, "Fakultas berhasil dihapus");
  } catch (error) {
    return handleApiError(error);
  }
}
