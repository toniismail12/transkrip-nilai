"use client";

import { DataTable } from "@/components/data-table/data-table";
import { fakultasColumns, type FakultasWithCount } from "./fakultas-columns";

interface FakultasTableProps {
  data: FakultasWithCount[];
}

export function FakultasTable({ data }: FakultasTableProps) {
  return (
    <DataTable
      columns={fakultasColumns}
      data={data}
      emptyTitle="Belum ada data fakultas"
      emptyDescription="Tambahkan fakultas pertama Anda untuk memulai."
    />
  );
}
