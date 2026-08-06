import type { Metadata } from "next";
import { FakultasForm } from "@/features/fakultas/fakultas-form";

export const metadata: Metadata = {
  title: "Tambah Fakultas — Cetak Transkrip",
};

export default function CreateFakultasPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-2xl">
        <FakultasForm />
      </div>
    </div>
  );
}
