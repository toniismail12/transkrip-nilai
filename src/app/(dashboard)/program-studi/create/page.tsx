import type { Metadata } from "next";
import { listAllActiveFakultas } from "@/services/fakultas.service";
import { ProgramStudiForm } from "@/features/program-studi/program-studi-form";

export const metadata: Metadata = {
  title: "Tambah Program Studi — Cetak Transkrip",
};

export default async function CreateProgramStudiPage() {
  const fakultasOptions = await listAllActiveFakultas();

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-2xl">
        <ProgramStudiForm fakultasOptions={fakultasOptions} />
      </div>
    </div>
  );
}
