import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { listUsers } from "@/services/user.service";
import { userQuerySchema } from "@/validators/user.validator";
import { Button } from "@/components/ui/button";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { UserTable } from "@/features/user/user-table";
import { UserRoleFilter } from "@/features/user/user-role-filter";

export const metadata: Metadata = {
  title: "Manajemen User — Cetak Transkrip",
};

interface UserPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function UserPage({ searchParams }: UserPageProps) {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const query = userQuerySchema.parse(params);
  const result = await listUsers(query);

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manajemen User</h1>
          <p className="text-muted-foreground text-sm">
            Kelola akun pengguna sistem dan hak aksesnya.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/user/create" />}>
          <Plus />
          Tambah User
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <DataTableSearch placeholder="Cari username, nama, atau email..." />
        <UserRoleFilter />
      </div>

      <UserTable data={result.data} currentUserId={currentUser.id} />

      <DataTablePagination page={result.page} pageSize={result.pageSize} total={result.total} />
    </div>
  );
}
