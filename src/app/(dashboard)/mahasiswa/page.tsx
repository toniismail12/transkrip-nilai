import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listMahasiswa } from "@/services/mahasiswa.service";
import { listAllActiveFakultas } from "@/services/fakultas.service";
import { listAllActiveProgramStudi } from "@/services/program-studi.service";
import { mahasiswaQuerySchema } from "@/validators/mahasiswa.validator";
import { Button } from "@/components/ui/button";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { MahasiswaTable } from "@/features/mahasiswa/mahasiswa-table";
import { MahasiswaFilters } from "@/features/mahasiswa/mahasiswa-filters";
import { MahasiswaImportDialog } from "@/features/mahasiswa/mahasiswa-import-dialog";
import { MahasiswaExportButtons } from "@/features/mahasiswa/mahasiswa-export-buttons";

export const metadata: Metadata = {
  title: "Mahasiswa — Cetak Transkrip",
};

interface MahasiswaPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MahasiswaPage({ searchParams }: MahasiswaPageProps) {
  const params = await searchParams;
  const query = mahasiswaQuerySchema.parse(params);

  const [result, fakultasOptions, programStudiOptions] = await Promise.all([
    listMahasiswa(query),
    listAllActiveFakultas(),
    listAllActiveProgramStudi(),
  ]);

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mahasiswa</h1>
          <p className="text-muted-foreground text-sm">
            Kelola data biodata mahasiswa dan status pencetakan transkrip.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MahasiswaImportDialog />
          <Button nativeButton={false} render={<Link href="/mahasiswa/create" />}>
            <Plus />
            Tambah Mahasiswa
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
          <DataTableSearch placeholder="Cari NPM atau nama..." />
          <MahasiswaFilters
            fakultasOptions={fakultasOptions}
            programStudiOptions={programStudiOptions}
          />
        </div>
        <MahasiswaExportButtons />
      </div>

      <MahasiswaTable data={result.data} />

      <DataTablePagination page={result.page} pageSize={result.pageSize} total={result.total} />
    </div>
  );
}
