import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { Badge } from "@/components/ui/badge";
import { TranskripRowActions } from "./transkrip-row-actions";
import type { TranskripListItem } from "@/services/transkrip.service";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function createTranskripColumns(canVoid: boolean): LegacyColumnDef<TranskripListItem>[] {
  return [
    {
      accessorKey: "npmSnapshot",
      header: "NPM",
    },
    {
      accessorKey: "namaSnapshot",
      header: "Nama",
    },
    {
      id: "ipk",
      header: "IPK",
      cell: ({ row }) => row.original.ipk.toFixed(2),
    },
    {
      accessorKey: "predikat",
      header: "Predikat",
    },
    {
      id: "totalSks",
      header: "Total SKS",
      cell: ({ row }) => row.original.totalSks,
    },
    {
      id: "tanggalCetak",
      header: () => <SortableHeader label="Tanggal Cetak" sortKey="tanggalCetak" />,
      cell: ({ row }) => formatDate(row.original.tanggalCetak),
    },
    {
      accessorKey: "cetakOlehNamaSnapshot",
      header: "Dicetak Oleh",
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "GENERATED" ? "default" : "destructive"}>
          {row.original.status === "GENERATED" ? "Aktif" : "Dibatalkan"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => <TranskripRowActions transkrip={row.original} canVoid={canVoid} />,
    },
  ];
}
