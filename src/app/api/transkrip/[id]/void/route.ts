import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { parseIdParam } from "@/lib/api/params";
import { voidTranskripSchema } from "@/validators/transkrip.validator";
import { voidTranskrip } from "@/services/transkrip.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const { reason } = voidTranskripSchema.parse(body);
    const transkrip = await voidTranskrip(parseIdParam(id), reason, {
      id: currentUser.id,
      name: currentUser.name,
    });
    return apiSuccess(transkrip, "Transkrip berhasil dibatalkan");
  } catch (error) {
    return handleApiError(error);
  }
}
