import type { Metadata } from "next";
import { Search } from "lucide-react";
import { nilaiRepository } from "@/repositories/nilai.repository";
import { ScraperError } from "@/lib/scraper-errors";
import { NilaiSearchForm } from "@/features/nilai/nilai-search-form";
import { NilaiResultTable } from "@/features/nilai/nilai-result-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";

export const metadata: Metadata = {
  title: "Nilai — Cetak Transkrip",
};

interface NilaiPageProps {
  searchParams: Promise<{ npm?: string }>;
}

export default async function NilaiPage({ searchParams }: NilaiPageProps) {
  const { npm } = await searchParams;

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nilai</h1>
        <p className="text-muted-foreground text-sm">
          Data nilai diambil secara langsung (live) dari SIMAKAD berdasarkan NPM. Halaman ini
          bersifat baca saja.
        </p>
      </div>

      <NilaiSearchForm />

      {!npm ? (
        <EmptyState
          icon={Search}
          title="Cari nilai mahasiswa"
          description="Masukkan NPM untuk melihat daftar mata kuliah dan IPK."
        />
      ) : (
        <NilaiResultSection npm={npm} />
      )}
    </div>
  );
}

async function NilaiResultSection({ npm }: { npm: string }) {
  try {
    const result = await nilaiRepository.getByNim(npm);
    return <NilaiResultTable result={result} />;
  } catch (error) {
    if (error instanceof ScraperError) {
      return <ErrorState title="Gagal memuat nilai" description={error.message} />;
    }
    throw error;
  }
}
