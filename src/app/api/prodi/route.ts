import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import {
  programStudiFormSchema,
  programStudiQuerySchema,
} from "@/validators/program-studi.validator";
import { createProgramStudi, listProgramStudi } from "@/services/program-studi.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const query = programStudiQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await listProgramStudi(query);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireUser();
    const body = await request.json();
    const input = programStudiFormSchema.parse(body);
    const programStudi = await createProgramStudi(input, {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(programStudi, "Program studi berhasil ditambahkan", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
