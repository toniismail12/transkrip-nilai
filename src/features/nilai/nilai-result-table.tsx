import { FileSearch } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import type { ScrapedNilaiResult } from "@/repositories/nilai.repository";

interface NilaiResultTableProps {
  result: ScrapedNilaiResult;
}

export function NilaiResultTable({ result }: NilaiResultTableProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Jumlah Bobot Nilai
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{result.totalSksSemester}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total SKS Bernilai
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{result.totalSksBernilai}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Indeks Prestasi Kumulatif
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{result.ipk.toFixed(2)}</CardContent>
        </Card>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No</TableHead>
              <TableHead>Kode MK</TableHead>
              <TableHead>Mata Kuliah</TableHead>
              <TableHead className="text-center">HM</TableHead>
              <TableHead className="text-center">AM</TableHead>
              <TableHead className="text-center">K</TableHead>
              <TableHead className="text-center">M</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr]:border-b-0">
            {result.courses.length ? (
              result.courses.map((course, index) => (
                <TableRow key={`${course.kodeMatakuliah}-${index}`}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{course.kodeMatakuliah}</TableCell>
                  <TableCell>{course.namaMatakuliah}</TableCell>
                  <TableCell className="text-center">{course.hurufMutu}</TableCell>
                  <TableCell className="text-center">{course.angkaMutu}</TableCell>
                  <TableCell className="text-center">{course.sks}</TableCell>
                  <TableCell className="text-center">{course.bobotSks}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <EmptyState icon={FileSearch} title="Belum ada nilai untuk NPM ini" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
