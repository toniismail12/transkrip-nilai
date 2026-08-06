"use client";

import { DataTable } from "@/components/data-table/data-table";
import { akreditasiColumns } from "./akreditasi-columns";
import type { Akreditasi } from "@/generated/prisma/client";

interface AkreditasiTableProps {
  data: Akreditasi[];
}

export function AkreditasiTable({ data }: AkreditasiTableProps) {
  return (
    <DataTable
      columns={akreditasiColumns}
      data={data}
      emptyTitle="Belum ada data akreditasi"
      emptyDescription="Tambahkan akreditasi pertama Anda untuk memulai."
    />
  );
}
