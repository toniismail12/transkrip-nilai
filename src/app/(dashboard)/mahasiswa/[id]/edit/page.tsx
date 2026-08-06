import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMahasiswaById } from "@/services/mahasiswa.service";
import { listAllActiveFakultas } from "@/services/fakultas.service";
import { listAllActiveProgramStudi } from "@/services/program-studi.service";
import { NotFoundError } from "@/lib/errors";
import { MahasiswaForm } from "@/features/mahasiswa/mahasiswa-form";

export const metadata: Metadata = {
  title: "Edit Mahasiswa — Cetak Transkrip",
};

interface EditMahasiswaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMahasiswaPage({ params }: EditMahasiswaPageProps) {
  const { id } = await params;
  const mahasiswaId = Number(id);

  if (!Number.isInteger(mahasiswaId)) {
    notFound();
  }

  try {
    const [mahasiswa, fakultasOptions, programStudiOptions] = await Promise.all([
      getMahasiswaById(mahasiswaId),
      listAllActiveFakultas(),
      listAllActiveProgramStudi(),
    ]);

    return (
      <div className="p-4 lg:p-6">
        <div className="mx-auto max-w-3xl">
          <MahasiswaForm
            mahasiswa={mahasiswa}
            fakultasOptions={fakultasOptions}
            programStudiOptions={programStudiOptions}
          />
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
