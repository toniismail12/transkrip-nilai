import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAkreditasiById } from "@/services/akreditasi.service";
import { NotFoundError } from "@/lib/errors";
import { AkreditasiForm } from "@/features/akreditasi/akreditasi-form";

export const metadata: Metadata = {
  title: "Edit Akreditasi — Cetak Transkrip",
};

interface EditAkreditasiPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAkreditasiPage({ params }: EditAkreditasiPageProps) {
  const { id } = await params;
  const akreditasiId = Number(id);

  if (!Number.isInteger(akreditasiId)) {
    notFound();
  }

  try {
    const akreditasi = await getAkreditasiById(akreditasiId);
    return (
      <div className="p-4 lg:p-6">
        <div className="mx-auto max-w-2xl">
          <AkreditasiForm akreditasi={akreditasi} />
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
