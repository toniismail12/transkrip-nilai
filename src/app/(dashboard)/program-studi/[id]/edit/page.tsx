import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProgramStudiById } from "@/services/program-studi.service";
import { listAllActiveFakultas } from "@/services/fakultas.service";
import { NotFoundError } from "@/lib/errors";
import { ProgramStudiForm } from "@/features/program-studi/program-studi-form";

export const metadata: Metadata = {
  title: "Edit Program Studi — Cetak Transkrip",
};

interface EditProgramStudiPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProgramStudiPage({ params }: EditProgramStudiPageProps) {
  const { id } = await params;
  const programStudiId = Number(id);

  if (!Number.isInteger(programStudiId)) {
    notFound();
  }

  try {
    const [programStudi, fakultasOptions] = await Promise.all([
      getProgramStudiById(programStudiId),
      listAllActiveFakultas(),
    ]);

    return (
      <div className="p-4 lg:p-6">
        <div className="mx-auto max-w-2xl">
          <ProgramStudiForm programStudi={programStudi} fakultasOptions={fakultasOptions} />
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
