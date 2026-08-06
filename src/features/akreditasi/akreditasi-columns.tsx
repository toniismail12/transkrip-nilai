import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { Badge } from "@/components/ui/badge";
import { AkreditasiRowActions } from "./akreditasi-row-actions";
import type { Akreditasi } from "@/generated/prisma/client";

export const akreditasiColumns: LegacyColumnDef<Akreditasi>[] = [
  {
    accessorKey: "nama",
    header: () => <SortableHeader label="Nama Akreditasi" sortKey="nama" />,
  },
  {
    accessorKey: "keterangan",
    header: "Keterangan",
    cell: ({ row }) => row.original.keterangan ?? "-",
  },
  {
    accessorKey: "isActive",
    header: () => <SortableHeader label="Status" sortKey="isActive" />,
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge variant="default">Aktif</Badge>
      ) : (
        <Badge variant="outline">Tidak Aktif</Badge>
      ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => <AkreditasiRowActions akreditasi={row.original} />,
  },
];
