import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFakultasById } from "@/services/fakultas.service";
import { NotFoundError } from "@/lib/errors";
import { FakultasForm } from "@/features/fakultas/fakultas-form";

export const metadata: Metadata = {
  title: "Edit Fakultas — Cetak Transkrip",
};

interface EditFakultasPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFakultasPage({ params }: EditFakultasPageProps) {
  const { id } = await params;
  const fakultasId = Number(id);

  if (!Number.isInteger(fakultasId)) {
    notFound();
  }

  try {
    const fakultas = await getFakultasById(fakultasId);
    return (
      <div className="p-4 lg:p-6">
        <div className="mx-auto max-w-2xl">
          <FakultasForm fakultas={fakultas} />
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
