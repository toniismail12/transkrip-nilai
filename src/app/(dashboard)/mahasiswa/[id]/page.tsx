import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, GraduationCap, Pencil } from "lucide-react";
import { getMahasiswaById } from "@/services/mahasiswa.service";
import { NotFoundError } from "@/lib/errors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Detail Mahasiswa — Cetak Transkrip",
};

interface MahasiswaDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(date: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="col-span-2">{value}</dd>
    </div>
  );
}

export default async function MahasiswaDetailPage({ params }: MahasiswaDetailPageProps) {
  const { id } = await params;
  const mahasiswaId = Number(id);

  if (!Number.isInteger(mahasiswaId)) {
    notFound();
  }

  try {
    const mahasiswa = await getMahasiswaById(mahasiswaId);

    return (
      <div className="flex flex-col gap-4 p-4 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{mahasiswa.nama}</h1>
            <p className="text-muted-foreground text-sm">NPM {mahasiswa.npm}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/nilai?npm=${mahasiswa.npm}`} />}
            >
              <GraduationCap />
              Lihat Nilai
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={`/transkrip/generate?npm=${mahasiswa.npm}`} />}
            >
              <FileText />
              Cetak Transkrip
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/mahasiswa/${mahasiswa.id}/edit`} />}
            >
              <Pencil />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Biodata</CardTitle>
            </CardHeader>
            <CardContent>
              <dl>
                <DetailRow label="Nama Lengkap" value={mahasiswa.nama} />
                <Separator />
                <DetailRow label="NPM" value={mahasiswa.npm} />
                <Separator />
                <DetailRow
                  label="Tempat, Tanggal Lahir"
                  value={`${mahasiswa.tempatLahir}, ${formatDate(mahasiswa.tanggalLahir)}`}
                />
                <Separator />
                <DetailRow label="Tahun Masuk" value={mahasiswa.tahunMasuk} />
                <Separator />
                <DetailRow label="Fakultas" value={mahasiswa.fakultas.nama} />
                <Separator />
                <DetailRow label="Program Studi" value={mahasiswa.programStudi.nama} />
                <Separator />
                <DetailRow
                  label="Status Cetak"
                  value={
                    <Badge
                      variant={mahasiswa.statusCetak === "SUDAH_CETAK" ? "default" : "outline"}
                    >
                      {mahasiswa.statusCetak === "SUDAH_CETAK" ? "Sudah Dicetak" : "Belum Dicetak"}
                    </Badge>
                  }
                />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Akademik</CardTitle>
            </CardHeader>
            <CardContent>
              <dl>
                <DetailRow label="Konsentrasi" value={mahasiswa.konsentrasi ?? "-"} />
                <Separator />
                <DetailRow label="Judul Skripsi" value={mahasiswa.judulSkripsi ?? "-"} />
                <Separator />
                <DetailRow label="Tanggal Lulus" value={formatDate(mahasiswa.tanggalLulus)} />
                <Separator />
                <DetailRow label="Tanggal SK Dekan" value={formatDate(mahasiswa.tglSkDekan)} />
                <Separator />
                <DetailRow label="No Ijazah" value={mahasiswa.noIjazah ?? "-"} />
                <Separator />
                <DetailRow label="No Seri" value={mahasiswa.noSeri ?? "-"} />
              </dl>
            </CardContent>
          </Card>
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
