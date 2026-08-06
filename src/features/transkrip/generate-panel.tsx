"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, FileCheck2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/feedback/loading-button";
import type { ApiEnvelope } from "@/lib/api/response";
import type { TranskripPdfData } from "@/services/transkrip.service";

interface GeneratePanelProps {
  npm: string;
  preview: TranskripPdfData;
  alreadyPrinted: boolean;
}

export function GeneratePanel({ npm, preview, alreadyPrinted }: GeneratePanelProps) {
  const router = useRouter();
  const [noSeri, setNoSeri] = useState(preview.noSeri ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGenerate() {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/transkrip/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npm, noSeri: noSeri || undefined }),
      });
      const json: ApiEnvelope<{ id: number }> = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal mencetak transkrip");
        return;
      }

      toast.success("Transkrip berhasil dicetak");
      router.push(`/transkrip/${json.data.id}`);
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{preview.biodata.nama}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">NPM {preview.biodata.npm}</p>
            <p>{preview.biodata.fakultas}</p>
            <p>{preview.biodata.programStudi}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Total SKS</p>
              <p className="text-lg font-semibold">{preview.totalSks}</p>
            </div>
            <div>
              <p className="text-muted-foreground">IPK</p>
              <p className="text-lg font-semibold">{preview.ipk.toFixed(2)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Predikat</p>
              <p className="text-lg font-semibold">{preview.predikat}</p>
            </div>
          </CardContent>
        </Card>

        {alreadyPrinted ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              Mahasiswa ini sudah pernah dicetak sebelumnya. Mencetak ulang akan membuat riwayat
              transkrip baru.
            </p>
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Nomor Seri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="no-seri">Nomor Seri Transkrip</Label>
              <Input
                id="no-seri"
                value={noSeri}
                onChange={(event) => setNoSeri(event.target.value)}
                placeholder="TRANS-2026-00001"
                disabled={isSubmitting}
              />
            </div>
            <LoadingButton className="w-full" isLoading={isSubmitting} onClick={handleGenerate}>
              <FileCheck2 />
              Cetak &amp; Simpan Transkrip
            </LoadingButton>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Preview PDF</CardTitle>
          </CardHeader>
          <CardContent className="h-[80vh]">
            <iframe
              src={`/api/transkrip/preview-pdf?npm=${encodeURIComponent(npm)}`}
              className="h-full w-full rounded-md border"
              title="Preview Transkrip"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
