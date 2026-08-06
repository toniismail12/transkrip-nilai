import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getEditableSettings } from "@/services/setting.service";
import { SettingForm } from "@/features/setting/setting-form";

export const metadata: Metadata = {
  title: "Setting — Cetak Transkrip",
};

export default async function SettingPage() {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const settings = await getEditableSettings();

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Setting</h1>
        <p className="text-muted-foreground text-sm">
          Konfigurasi identitas institusi, integrasi SIMAKAD, dan aturan predikat kelulusan.
        </p>
      </div>

      <div className="max-w-4xl">
        <SettingForm settings={settings} />
      </div>
    </div>
  );
}
