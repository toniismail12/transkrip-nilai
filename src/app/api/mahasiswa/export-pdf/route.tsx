import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireUser } from "@/lib/auth/session";
import { listMahasiswaForExport } from "@/services/mahasiswa.service";
import { MahasiswaListPdf } from "@/features/mahasiswa/mahasiswa-list-pdf";
import { handleApiError } from "@/lib/api/handle-error";

const STATUS_CETAK_LABEL: Record<string, string> = {
  BELUM_CETAK: "Belum Dicetak",
  SUDAH_CETAK: "Sudah Dicetak",
};

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

    const pdfBuffer = await renderToBuffer(
      <MahasiswaListPdf
        rows={rows.map((row) => ({
          npm: row.npm,
          nama: row.nama,
          fakultas: row.fakultas.nama,
          programStudi: row.programStudi.nama,
          tahunMasuk: row.tahunMasuk,
          statusCetak: STATUS_CETAK_LABEL[row.statusCetak] ?? row.statusCetak,
        }))}
        generatedAt={new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      />,
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="data-mahasiswa.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
