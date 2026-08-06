"use client";

import { DataTable } from "@/components/data-table/data-table";
import { mahasiswaColumns, type MahasiswaWithRelations } from "./mahasiswa-columns";

interface MahasiswaTableProps {
  data: MahasiswaWithRelations[];
}

export function MahasiswaTable({ data }: MahasiswaTableProps) {
  return (
    <DataTable
      columns={mahasiswaColumns}
      data={data}
      emptyTitle="Belum ada data mahasiswa"
      emptyDescription="Tambahkan mahasiswa pertama Anda atau impor dari Excel."
    />
  );
}
