"use client";

import { DataTable } from "@/components/data-table/data-table";
import { createTranskripColumns } from "./transkrip-columns";
import type { TranskripListItem } from "@/services/transkrip.service";

interface TranskripTableProps {
  data: TranskripListItem[];
  canVoid: boolean;
}

export function TranskripTable({ data, canVoid }: TranskripTableProps) {
  return (
    <DataTable
      columns={createTranskripColumns(canVoid)}
      data={data}
      emptyTitle="Belum ada transkrip yang dicetak"
      emptyDescription="Cetak transkrip pertama dari halaman Cetak Transkrip Baru."
    />
  );
}
