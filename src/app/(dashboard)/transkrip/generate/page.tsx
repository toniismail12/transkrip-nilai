import type { Metadata } from "next";
import { FileCheck2 } from "lucide-react";
import { previewTranskrip } from "@/services/transkrip.service";
import { prisma } from "@/lib/prisma";
import { ScraperError } from "@/lib/scraper-errors";
import { NotFoundError } from "@/lib/errors";
import { GenerateSearchForm } from "@/features/transkrip/generate-search-form";
import { GeneratePanel } from "@/features/transkrip/generate-panel";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";

export const metadata: Metadata = {
  title: "Cetak Transkrip Baru — Cetak Transkrip",
};

interface GenerateTranskripPageProps {
  searchParams: Promise<{ npm?: string }>;
}

export default async function GenerateTranskripPage({ searchParams }: GenerateTranskripPageProps) {
  const { npm } = await searchParams;

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cetak Transkrip Baru</h1>
        <p className="text-muted-foreground text-sm">
          Cari mahasiswa berdasarkan NPM, tinjau data nilai secara langsung dari SIMAKAD, lalu cetak
          dan simpan transkrip.
        </p>
      </div>

      <GenerateSearchForm />

      {!npm ? (
        <EmptyState
          icon={FileCheck2}
          title="Cari mahasiswa untuk mencetak transkrip"
          description="Masukkan NPM pada kolom pencarian di atas."
        />
      ) : (
        <GenerateSection npm={npm} />
      )}
    </div>
  );
}

async function GenerateSection({ npm }: { npm: string }) {
  try {
    const [preview, mahasiswa] = await Promise.all([
      previewTranskrip(npm),
      prisma.mahasiswa.findFirst({ where: { npm, deletedAt: null } }),
    ]);

    return (
      <GeneratePanel
        npm={npm}
        preview={preview}
        alreadyPrinted={mahasiswa?.statusCetak === "SUDAH_CETAK"}
      />
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return <ErrorState title="Mahasiswa tidak ditemukan" description={error.message} />;
    }
    if (error instanceof ScraperError) {
      return <ErrorState title="Gagal memuat data nilai" description={error.message} />;
    }
    throw error;
  }
}
