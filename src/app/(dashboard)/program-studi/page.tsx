import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listProgramStudi } from "@/services/program-studi.service";
import { programStudiQuerySchema } from "@/validators/program-studi.validator";
import { Button } from "@/components/ui/button";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { ProgramStudiTable } from "@/features/program-studi/program-studi-table";

export const metadata: Metadata = {
  title: "Program Studi — Cetak Transkrip",
};

interface ProgramStudiPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProgramStudiPage({ searchParams }: ProgramStudiPageProps) {
  const params = await searchParams;
  const query = programStudiQuerySchema.parse(params);
  const result = await listProgramStudi(query);

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Program Studi</h1>
          <p className="text-muted-foreground text-sm">
            Kelola data program studi di setiap fakultas.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/program-studi/create" />}>
          <Plus />
          Tambah Program Studi
        </Button>
      </div>

      <DataTableSearch placeholder="Cari nama atau kode..." />

      <ProgramStudiTable data={result.data} />

      <DataTablePagination page={result.page} pageSize={result.pageSize} total={result.total} />
    </div>
  );
}
