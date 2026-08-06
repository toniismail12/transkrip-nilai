import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { settingFormSchema } from "@/validators/setting.validator";
import { getEditableSettings, updateEditableSettings } from "@/services/setting.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    const settings = await getEditableSettings();
    return apiSuccess(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await requireRole(["ADMIN"]);
    const body = await request.json();
    const input = settingFormSchema.parse(body);
    const settings = await updateEditableSettings(
      {
        institution_name: input.institution_name,
        institution_address: input.institution_address ?? "",
        simakad_base_url: input.simakad_base_url,
        scrape_timeout_ms: input.scrape_timeout_ms,
        predikat_thresholds: input.predikat_thresholds,
      },
      { id: currentUser.id, name: currentUser.name },
    );
    return apiSuccess(settings, "Pengaturan berhasil disimpan");
  } catch (error) {
    return handleApiError(error);
  }
}
