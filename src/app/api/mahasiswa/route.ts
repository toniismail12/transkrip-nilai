import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { mahasiswaFormSchema, mahasiswaQuerySchema } from "@/validators/mahasiswa.validator";
import { createMahasiswa, listMahasiswa } from "@/services/mahasiswa.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const query = mahasiswaQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await listMahasiswa(query);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireUser();
    const body = await request.json();
    const input = mahasiswaFormSchema.parse(body);
    const mahasiswa = await createMahasiswa(input, {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(mahasiswa, "Mahasiswa berhasil ditambahkan", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
