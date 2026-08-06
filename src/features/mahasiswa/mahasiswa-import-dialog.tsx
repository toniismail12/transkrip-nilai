"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/feedback/loading-button";
import type { ApiEnvelope } from "@/lib/api/response";
import type { ImportMahasiswaResult } from "@/services/mahasiswa-excel.service";

export function MahasiswaImportDialog() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ImportMahasiswaResult | null>(null);

  async function handleSubmit() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Pilih file Excel (.xlsx) terlebih dahulu");
      return;
    }

    setIsSubmitting(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/mahasiswa/import", { method: "POST", body: formData });
      const json: ApiEnvelope<ImportMahasiswaResult> = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal mengimpor data");
        return;
      }

      toast.success(json.message);
      setResult(json.data);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setResult(null);
      }}
    >
      <DialogTrigger render={<Button variant="outline" />}>
        <Upload />
        Import Excel
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Data Mahasiswa</DialogTitle>
          <DialogDescription>
            Unggah file Excel (.xlsx) berisi kolom: NPM, Nama, Tempat Lahir, Tanggal Lahir, Tahun
            Masuk, Fakultas, Program Studi, dan kolom opsional lainnya.
          </DialogDescription>
        </DialogHeader>

        <Input ref={fileInputRef} type="file" accept=".xlsx" disabled={isSubmitting} />

        {result ? (
          <div className="max-h-48 overflow-y-auto rounded-lg border p-3 text-sm">
            <p className="font-medium">
              {result.successCount} dari {result.totalRows} baris berhasil diimpor
            </p>
            {result.failures.length > 0 ? (
              <ul className="text-destructive mt-2 space-y-1">
                {result.failures.map((failure) => (
                  <li key={failure.row}>
                    Baris {failure.row} (NPM {failure.npm}): {failure.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" disabled={isSubmitting} onClick={() => setOpen(false)}>
            Tutup
          </Button>
          <LoadingButton isLoading={isSubmitting} onClick={handleSubmit}>
            Impor
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
