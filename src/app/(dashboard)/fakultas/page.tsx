import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listFakultas } from "@/services/fakultas.service";
import { fakultasQuerySchema } from "@/validators/fakultas.validator";
import { Button } from "@/components/ui/button";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { FakultasTable } from "@/features/fakultas/fakultas-table";

export const metadata: Metadata = {
  title: "Fakultas — Cetak Transkrip",
};

interface FakultasPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function FakultasPage({ searchParams }: FakultasPageProps) {
  const params = await searchParams;
  const query = fakultasQuerySchema.parse(params);
  const result = await listFakultas(query);

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fakultas</h1>
          <p className="text-muted-foreground text-sm">Kelola data fakultas dan dekan.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/fakultas/create" />}>
          <Plus />
          Tambah Fakultas
        </Button>
      </div>

      <DataTableSearch placeholder="Cari nama, kode, atau dekan..." />

      <FakultasTable data={result.data} />

      <DataTablePagination page={result.page} pageSize={result.pageSize} total={result.total} />
    </div>
  );
}
