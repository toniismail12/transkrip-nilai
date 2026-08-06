import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { parseIdParam } from "@/lib/api/params";
import { mahasiswaFormSchema } from "@/validators/mahasiswa.validator";
import { deleteMahasiswa, getMahasiswaById, updateMahasiswa } from "@/services/mahasiswa.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireUser();
    const { id } = await params;
    const mahasiswa = await getMahasiswaById(parseIdParam(id));
    return apiSuccess(mahasiswa);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const input = mahasiswaFormSchema.parse(body);
    const mahasiswa = await updateMahasiswa(parseIdParam(id), input, {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(mahasiswa, "Mahasiswa berhasil diperbarui");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await requireUser();
    const { id } = await params;
    await deleteMahasiswa(parseIdParam(id), {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(null, "Mahasiswa berhasil dihapus");
  } catch (error) {
    return handleApiError(error);
  }
}
