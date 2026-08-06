import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { Badge } from "@/components/ui/badge";
import { UserRowActions } from "./user-row-actions";
import type { SafeUser } from "@/services/user.service";

const ROLE_LABEL: Record<SafeUser["role"], string> = {
  ADMIN: "Administrator",
  OPERATOR: "Operator",
};

function formatLastLogin(date: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function createUserColumns(currentUserId: number): LegacyColumnDef<SafeUser>[] {
  return [
    {
      accessorKey: "username",
      header: () => <SortableHeader label="Username" sortKey="username" />,
    },
    {
      accessorKey: "name",
      header: () => <SortableHeader label="Nama" sortKey="name" />,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email ?? "-",
    },
    {
      accessorKey: "role",
      header: () => <SortableHeader label="Role" sortKey="role" />,
      cell: ({ row }) => (
        <Badge variant={row.original.role === "ADMIN" ? "default" : "secondary"}>
          {ROLE_LABEL[row.original.role]}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="default">Aktif</Badge>
        ) : (
          <Badge variant="outline">Tidak Aktif</Badge>
        ),
    },
    {
      accessorKey: "lastLoginAt",
      header: "Login Terakhir",
      cell: ({ row }) => formatLastLogin(row.original.lastLoginAt),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <UserRowActions user={row.original} isCurrentUser={row.original.id === currentUserId} />
      ),
    },
  ];
}
