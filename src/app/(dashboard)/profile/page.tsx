import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/features/profile/profile-form";
import { ChangePasswordForm } from "@/features/profile/change-password-form";

export const metadata: Metadata = {
  title: "Profil Admin — Cetak Transkrip",
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrator",
  OPERATOR: "Operator",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profil Saya</h1>
          <p className="text-muted-foreground text-sm">
            Kelola informasi akun dan keamanan password Anda.
          </p>
        </div>
        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
          {ROLE_LABEL[user.role] ?? user.role}
        </Badge>
      </div>

      <div className="grid max-w-4xl grid-cols-1 gap-4 lg:grid-cols-2">
        <ProfileForm profile={{ username: user.username, name: user.name, email: user.email }} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
