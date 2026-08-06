import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { akreditasiFormSchema, akreditasiQuerySchema } from "@/validators/akreditasi.validator";
import { createAkreditasi, listAkreditasi } from "@/services/akreditasi.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const query = akreditasiQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await listAkreditasi(query);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireUser();
    const body = await request.json();
    const input = akreditasiFormSchema.parse(body);
    const akreditasi = await createAkreditasi(input, {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(akreditasi, "Akreditasi berhasil ditambahkan", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
