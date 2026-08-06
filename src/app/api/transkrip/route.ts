import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { transkripQuerySchema } from "@/validators/transkrip.validator";
import { listTranskrip } from "@/services/transkrip.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const query = transkripQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await listTranskrip(query);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
