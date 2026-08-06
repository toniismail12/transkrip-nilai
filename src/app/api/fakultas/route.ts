import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { fakultasFormSchema, fakultasQuerySchema } from "@/validators/fakultas.validator";
import { createFakultas, listFakultas } from "@/services/fakultas.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const query = fakultasQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await listFakultas(query);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireUser();
    const body = await request.json();
    const input = fakultasFormSchema.parse(body);
    const fakultas = await createFakultas(input, {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(fakultas, "Fakultas berhasil ditambahkan", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
