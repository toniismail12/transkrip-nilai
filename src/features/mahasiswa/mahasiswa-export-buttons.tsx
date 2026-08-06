"use client";

import { useSearchParams } from "next/navigation";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MahasiswaExportButtons() {
  const searchParams = useSearchParams();

  const params = new URLSearchParams();
  const search = searchParams.get("search");
  const fakultasId = searchParams.get("fakultasId");
  const programStudiId = searchParams.get("programStudiId");
  const statusCetak = searchParams.get("statusCetak");
  if (search) params.set("search", search);
  if (fakultasId) params.set("fakultasId", fakultasId);
  if (programStudiId) params.set("programStudiId", programStudiId);
  if (statusCetak) params.set("statusCetak", statusCetak);

  const query = params.toString();

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        nativeButton={false}
        render={<a href={`/api/mahasiswa/export${query ? `?${query}` : ""}`} />}
      >
        <FileSpreadsheet />
        Export Excel
      </Button>
      <Button
        variant="outline"
        nativeButton={false}
        render={<a href={`/api/mahasiswa/export-pdf${query ? `?${query}` : ""}`} />}
      >
        <FileText />
        Export PDF
      </Button>
    </div>
  );
}
