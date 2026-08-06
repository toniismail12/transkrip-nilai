import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { FakultasRowActions } from "./fakultas-row-actions";
import type { Fakultas } from "@/generated/prisma/client";

export type FakultasWithCount = Fakultas & {
  _count: { programStudiList: number; mahasiswaList: number };
};

export const fakultasColumns: LegacyColumnDef<FakultasWithCount>[] = [
  {
    accessorKey: "nama",
    header: () => <SortableHeader label="Nama Fakultas" sortKey="nama" />,
  },
  {
    accessorKey: "kode",
    header: () => <SortableHeader label="Kode" sortKey="kode" />,
    cell: ({ row }) => row.original.kode ?? "-",
  },
  {
    accessorKey: "dekan",
    header: () => <SortableHeader label="Dekan" sortKey="dekan" />,
  },
  {
    id: "programStudiCount",
    header: "Program Studi",
    cell: ({ row }) => row.original._count.programStudiList,
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => <FakultasRowActions fakultas={row.original} />,
  },
];
