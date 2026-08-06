import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { parseIdParam } from "@/lib/api/params";
import { programStudiFormSchema } from "@/validators/program-studi.validator";
import {
  deleteProgramStudi,
  getProgramStudiById,
  updateProgramStudi,
} from "@/services/program-studi.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireUser();
    const { id } = await params;
    const programStudi = await getProgramStudiById(parseIdParam(id));
    return apiSuccess(programStudi);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const input = programStudiFormSchema.parse(body);
    const programStudi = await updateProgramStudi(parseIdParam(id), input, {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(programStudi, "Program studi berhasil diperbarui");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await requireUser();
    const { id } = await params;
    await deleteProgramStudi(parseIdParam(id), {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(null, "Program studi berhasil dihapus");
  } catch (error) {
    return handleApiError(error);
  }
}
