"use client";

import { DataTable } from "@/components/data-table/data-table";
import { programStudiColumns, type ProgramStudiWithRelations } from "./program-studi-columns";

interface ProgramStudiTableProps {
  data: ProgramStudiWithRelations[];
}

export function ProgramStudiTable({ data }: ProgramStudiTableProps) {
  return (
    <DataTable
      columns={programStudiColumns}
      data={data}
      emptyTitle="Belum ada data program studi"
      emptyDescription="Tambahkan program studi pertama Anda untuk memulai."
    />
  );
}
