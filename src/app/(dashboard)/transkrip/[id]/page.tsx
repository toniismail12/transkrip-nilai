import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranskripById } from "@/services/transkrip.service";
import { getCurrentUser } from "@/lib/auth/session";
import { NotFoundError } from "@/lib/errors";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TranskripDetailActions } from "@/features/transkrip/transkrip-detail-actions";

export const metadata: Metadata = {
  title: "Detail Transkrip — Cetak Transkrip",
};

interface TranskripDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function TranskripDetailPage({ params }: TranskripDetailPageProps) {
  const { id } = await params;
  const transkripId = Number(id);

  if (!Number.isInteger(transkripId)) {
    notFound();
  }

  try {
    const [transkrip, user] = await Promise.all([getTranskripById(transkripId), getCurrentUser()]);

    return (
      <div className="flex flex-col gap-4 p-4 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{transkrip.namaSnapshot}</h1>
            <p className="text-muted-foreground text-sm">
              NPM {transkrip.npmSnapshot} · Dicetak {formatDate(transkrip.tanggalCetak)}
            </p>
          </div>
          <TranskripDetailActions
            transkripId={transkrip.id}
            canVoid={user?.role === "ADMIN" && transkrip.status === "GENERATED"}
          />
        </div>

        {transkrip.status === "VOID" ? (
          <div className="border-destructive/30 bg-destructive/10 flex items-center gap-2 rounded-lg border p-3 text-sm">
            <Badge variant="destructive">Dibatalkan</Badge>
            <span>{transkrip.voidReason}</span>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Total SKS</p>
                <p className="text-lg font-semibold">{transkrip.totalSks}</p>
              </div>
              <div>
                <p className="text-muted-foreground">IPK</p>
                <p className="text-lg font-semibold">{Number(transkrip.ipk).toFixed(2)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Predikat</p>
                <p className="text-lg font-semibold">{transkrip.predikat}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Nomor Seri</p>
                <p className="font-medium">{transkrip.noSeri ?? "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Dicetak Oleh</p>
                <p className="font-medium">{transkrip.cetakOlehNamaSnapshot}</p>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Dokumen Transkrip</CardTitle>
              </CardHeader>
              <CardContent className="h-[80vh]">
                <iframe
                  src={`/api/transkrip/${transkrip.id}/pdf`}
                  className="h-full w-full rounded-md border"
                  title="Dokumen Transkrip"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }
}
