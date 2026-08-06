import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireUser } from "@/lib/auth/session";
import { nilaiQuerySchema } from "@/validators/nilai.validator";
import { previewTranskrip } from "@/services/transkrip.service";
import { TranscriptDocument } from "@/features/transkrip/pdf/TranscriptDocument";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const { npm } = nilaiQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const data = await previewTranskrip(npm);

    const pdfBuffer = await renderToBuffer(
      <TranscriptDocument data={data} watermarkText="PREVIEW" />,
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="preview-transkrip-${npm}.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
