"use client";

import { DataTable } from "@/components/data-table/data-table";
import { createUserColumns } from "./user-columns";
import type { SafeUser } from "@/services/user.service";

interface UserTableProps {
  data: SafeUser[];
  currentUserId: number;
}

export function UserTable({ data, currentUserId }: UserTableProps) {
  return (
    <DataTable
      columns={createUserColumns(currentUserId)}
      data={data}
      emptyTitle="Belum ada data user"
      emptyDescription="Tambahkan user pertama untuk mulai mengelola akses sistem."
    />
  );
}
