import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { generateTranskripSchema } from "@/validators/transkrip.validator";
import { generateTranskrip } from "@/services/transkrip.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const input = generateTranskripSchema.parse(body);

    const transkrip = await generateTranskrip({
      npm: input.npm,
      noSeri: input.noSeri,
      userId: user.id,
      userName: user.name,
    });

    return apiSuccess(transkrip, "Transkrip berhasil dicetak", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
