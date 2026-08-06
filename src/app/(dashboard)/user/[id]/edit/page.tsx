import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserById } from "@/services/user.service";
import { NotFoundError } from "@/lib/errors";
import { UserForm } from "@/features/user/user-form";

export const metadata: Metadata = {
  title: "Edit User — Cetak Transkrip",
};

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId)) {
    notFound();
  }

  try {
    const user = await getUserById(userId);
    return (
      <div className="p-4 lg:p-6">
        <div className="mx-auto max-w-2xl">
          <UserForm user={user} />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }
}
