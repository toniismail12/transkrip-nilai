import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { listMahasiswaForExport } from "@/services/mahasiswa.service";
import { exportMahasiswaExcel } from "@/services/mahasiswa-excel.service";
import { handleApiError } from "@/lib/api/handle-error";

const exportQuerySchema = z.object({
  search: z.string().optional(),
  fakultasId: z.coerce.number().int().positive().optional(),
  programStudiId: z.coerce.number().int().positive().optional(),
  statusCetak: z.enum(["BELUM_CETAK", "SUDAH_CETAK"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const query = exportQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const rows = await listMahasiswaForExport(query);
    const buffer = await exportMahasiswaExcel(rows);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="data-mahasiswa.xlsx"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
