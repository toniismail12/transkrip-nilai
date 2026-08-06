import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { ProgramStudiRowActions } from "./program-studi-row-actions";
import type { ProgramStudi } from "@/generated/prisma/client";

export type ProgramStudiWithRelations = ProgramStudi & {
  fakultas: { id: number; nama: string };
  _count: { mahasiswaList: number };
};

export const programStudiColumns: LegacyColumnDef<ProgramStudiWithRelations>[] = [
  {
    accessorKey: "nama",
    header: () => <SortableHeader label="Nama Program Studi" sortKey="nama" />,
  },
  {
    accessorKey: "kode",
    header: () => <SortableHeader label="Kode" sortKey="kode" />,
    cell: ({ row }) => row.original.kode ?? "-",
  },
  {
    accessorKey: "jenjang",
    header: () => <SortableHeader label="Jenjang" sortKey="jenjang" />,
  },
  {
    id: "fakultas",
    header: "Fakultas",
    cell: ({ row }) => row.original.fakultas.nama,
  },
  {
    id: "mahasiswaCount",
    header: "Jumlah Mahasiswa",
    cell: ({ row }) => row.original._count.mahasiswaList,
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => <ProgramStudiRowActions programStudi={row.original} />,
  },
];
