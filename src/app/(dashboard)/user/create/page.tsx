import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { UserForm } from "@/features/user/user-form";

export const metadata: Metadata = {
  title: "Tambah User — Cetak Transkrip",
};

export default async function CreateUserPage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-2xl">
        <UserForm />
      </div>
    </div>
  );
}
