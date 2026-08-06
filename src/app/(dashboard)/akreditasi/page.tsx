import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listAkreditasi } from "@/services/akreditasi.service";
import { akreditasiQuerySchema } from "@/validators/akreditasi.validator";
import { Button } from "@/components/ui/button";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { AkreditasiTable } from "@/features/akreditasi/akreditasi-table";

export const metadata: Metadata = {
  title: "Akreditasi — Cetak Transkrip",
};

interface AkreditasiPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AkreditasiPage({ searchParams }: AkreditasiPageProps) {
  const params = await searchParams;
  const query = akreditasiQuerySchema.parse(params);
  const result = await listAkreditasi(query);

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Akreditasi</h1>
          <p className="text-muted-foreground text-sm">Kelola data akreditasi institusi.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/akreditasi/create" />}>
          <Plus />
          Tambah Akreditasi
        </Button>
      </div>

      <DataTableSearch placeholder="Cari nama atau keterangan..." />

      <AkreditasiTable data={result.data} />

      <DataTablePagination page={result.page} pageSize={result.pageSize} total={result.total} />
    </div>
  );
}
