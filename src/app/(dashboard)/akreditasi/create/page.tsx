import type { Metadata } from "next";
import { AkreditasiForm } from "@/features/akreditasi/akreditasi-form";

export const metadata: Metadata = {
  title: "Tambah Akreditasi — Cetak Transkrip",
};

export default function CreateAkreditasiPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-2xl">
        <AkreditasiForm />
      </div>
    </div>
  );
}
