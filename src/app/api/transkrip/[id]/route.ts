import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { parseIdParam } from "@/lib/api/params";
import { getTranskripById } from "@/services/transkrip.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireUser();
    const { id } = await params;
    const transkrip = await getTranskripById(parseIdParam(id));
    return apiSuccess(transkrip);
  } catch (error) {
    return handleApiError(error);
  }
}
