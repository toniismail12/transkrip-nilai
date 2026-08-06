import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { Badge } from "@/components/ui/badge";
import { MahasiswaRowActions } from "./mahasiswa-row-actions";
import type { Mahasiswa } from "@/generated/prisma/client";

export type MahasiswaWithRelations = Mahasiswa & {
  fakultas: { id: number; nama: string };
  programStudi: { id: number; nama: string };
};

const STATUS_LABEL: Record<string, string> = {
  BELUM_CETAK: "Belum Dicetak",
  SUDAH_CETAK: "Sudah Dicetak",
};

export const mahasiswaColumns: LegacyColumnDef<MahasiswaWithRelations>[] = [
  {
    accessorKey: "npm",
    header: () => <SortableHeader label="NPM" sortKey="npm" />,
  },
  {
    accessorKey: "nama",
    header: () => <SortableHeader label="Nama" sortKey="nama" />,
  },
  {
    id: "fakultas",
    header: "Fakultas",
    cell: ({ row }) => row.original.fakultas.nama,
  },
  {
    id: "programStudi",
    header: "Program Studi",
    cell: ({ row }) => row.original.programStudi.nama,
  },
  {
    accessorKey: "tahunMasuk",
    header: () => <SortableHeader label="Angkatan" sortKey="tahunMasuk" />,
  },
  {
    accessorKey: "statusCetak",
    header: () => <SortableHeader label="Status Cetak" sortKey="statusCetak" />,
    cell: ({ row }) => (
      <Badge variant={row.original.statusCetak === "SUDAH_CETAK" ? "default" : "outline"}>
        {STATUS_LABEL[row.original.statusCetak]}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => <MahasiswaRowActions mahasiswa={row.original} />,
  },
];
