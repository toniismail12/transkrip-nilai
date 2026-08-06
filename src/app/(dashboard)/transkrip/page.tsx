import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listTranskrip } from "@/services/transkrip.service";
import { transkripQuerySchema } from "@/validators/transkrip.validator";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { TranskripTable } from "@/features/transkrip/transkrip-table";

export const metadata: Metadata = {
  title: "Transkrip — Cetak Transkrip",
};

interface TranskripPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TranskripPage({ searchParams }: TranskripPageProps) {
  const params = await searchParams;
  const query = transkripQuerySchema.parse(params);

  const [result, user] = await Promise.all([listTranskrip(query), getCurrentUser()]);

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Riwayat Transkrip</h1>
          <p className="text-muted-foreground text-sm">
            Daftar transkrip akademik yang telah dicetak.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/transkrip/generate" />}>
          <Plus />
          Cetak Transkrip Baru
        </Button>
      </div>

      <DataTableSearch placeholder="Cari NPM atau nama..." />

      <TranskripTable data={result.data} canVoid={user?.role === "ADMIN"} />

      <DataTablePagination page={result.page} pageSize={result.pageSize} total={result.total} />
    </div>
  );
}
