import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { nilaiQuerySchema } from "@/validators/nilai.validator";
import { nilaiRepository } from "@/repositories/nilai.repository";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const { npm } = nilaiQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await nilaiRepository.getByNim(npm);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
