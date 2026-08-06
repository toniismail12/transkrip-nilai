"use client";

import { useState } from "react";
import { Ban, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoidTranskripDialog } from "./void-transkrip-dialog";

interface TranskripDetailActionsProps {
  transkripId: number;
  canVoid: boolean;
}

export function TranskripDetailActions({ transkripId, canVoid }: TranskripDetailActionsProps) {
  const [voidOpen, setVoidOpen] = useState(false);
  const pdfUrl = `/api/transkrip/${transkripId}/pdf`;

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" nativeButton={false} render={<a href={pdfUrl} download />}>
        <Download />
        Download PDF
      </Button>
      <Button variant="outline" nativeButton={false} render={<a href={pdfUrl} target="_blank" />}>
        <Printer />
        Cetak
      </Button>
      {canVoid ? (
        <Button variant="destructive" onClick={() => setVoidOpen(true)}>
          <Ban />
          Batalkan
        </Button>
      ) : null}

      <VoidTranskripDialog transkripId={transkripId} open={voidOpen} onOpenChange={setVoidOpen} />
    </div>
  );
}
