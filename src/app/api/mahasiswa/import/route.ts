import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { importMahasiswaExcel } from "@/services/mahasiswa-excel.service";
import { ACTIVITY_ACTIONS, logActivity } from "@/services/activity-log.service";
import { apiSuccess } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/handle-error";
import { BadRequestError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireUser();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new BadRequestError("File Excel wajib diunggah");
    }

    const allowedExtensions = [".xlsx"];
    const hasValidExtension = allowedExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    );
    if (!hasValidExtension) {
      throw new BadRequestError("Format file harus .xlsx");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await importMahasiswaExcel(buffer);

    await logActivity({
      userId: currentUser.id,
      userNama: currentUser.name,
      action: ACTIVITY_ACTIONS.IMPORT_MAHASISWA,
      entityType: "Mahasiswa",
      entityId: null,
      description: `Mengimpor ${result.successCount} data mahasiswa dari Excel`,
      metadata: {
        totalRows: result.totalRows,
        successCount: result.successCount,
        failureCount: result.failures.length,
      },
    });

    const message =
      result.failures.length === 0
        ? `${result.successCount} data mahasiswa berhasil diimpor`
        : `${result.successCount} dari ${result.totalRows} data berhasil diimpor, ${result.failures.length} baris gagal`;

    return apiSuccess(result, message);
  } catch (error) {
    return handleApiError(error);
  }
}
