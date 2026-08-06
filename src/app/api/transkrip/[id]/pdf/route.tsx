import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireUser } from "@/lib/auth/session";
import { parseIdParam } from "@/lib/api/params";
import { getTranskripPdfData } from "@/services/transkrip.service";
import { TranscriptDocument } from "@/features/transkrip/pdf/TranscriptDocument";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireUser();
    const { id } = await params;
    const transkripId = parseIdParam(id);
    const data = await getTranskripPdfData(transkripId);

    const pdfBuffer = await renderToBuffer(<TranscriptDocument data={data} />);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="transkrip-${data.biodata.npm}.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
