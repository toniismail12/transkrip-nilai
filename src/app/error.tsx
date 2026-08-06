"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="bg-destructive/10 text-destructive flex size-16 items-center justify-center rounded-full">
        <AlertTriangle className="size-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Terjadi kesalahan</h1>
        <p className="text-muted-foreground">
          Sistem mengalami gangguan saat memuat halaman ini. Silakan coba lagi.
        </p>
      </div>
      <Button onClick={reset}>Coba Lagi</Button>
    </div>
  );
}
