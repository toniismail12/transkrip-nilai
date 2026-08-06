import type { Metadata } from "next";
import { listAllActiveFakultas } from "@/services/fakultas.service";
import { listAllActiveProgramStudi } from "@/services/program-studi.service";
import { MahasiswaForm } from "@/features/mahasiswa/mahasiswa-form";

export const metadata: Metadata = {
  title: "Tambah Mahasiswa — Cetak Transkrip",
};

export default async function CreateMahasiswaPage() {
  const [fakultasOptions, programStudiOptions] = await Promise.all([
    listAllActiveFakultas(),
    listAllActiveProgramStudi(),
  ]);

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-3xl">
        <MahasiswaForm
          fakultasOptions={fakultasOptions}
          programStudiOptions={programStudiOptions}
        />
      </div>
    </div>
  );
}
