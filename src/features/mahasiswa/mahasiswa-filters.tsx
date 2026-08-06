"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_VALUE = "__all__";

interface MahasiswaFiltersProps {
  fakultasOptions: { id: number; nama: string }[];
  programStudiOptions: { id: number; nama: string; fakultasId: number }[];
}

export function MahasiswaFilters({ fakultasOptions, programStudiOptions }: MahasiswaFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFakultasId = searchParams.get("fakultasId") ?? "";
  const currentProgramStudiId = searchParams.get("programStudiId") ?? "";
  const currentStatus = searchParams.get("statusCetak") ?? "";

  const filteredProgramStudi = currentFakultasId
    ? programStudiOptions.filter((prodi) => prodi.fakultasId === Number(currentFakultasId))
    : programStudiOptions;

  const fakultasItems: Record<string, string> = {
    [ALL_VALUE]: "Semua Fakultas",
    ...Object.fromEntries(fakultasOptions.map((f) => [String(f.id), f.nama])),
  };

  const programStudiItems: Record<string, string> = {
    [ALL_VALUE]: "Semua Program Studi",
    ...Object.fromEntries(filteredProgramStudi.map((p) => [String(p.id), p.nama])),
  };

  const statusItems: Record<string, string> = {
    [ALL_VALUE]: "Semua Status",
    BELUM_CETAK: "Belum Dicetak",
    SUDAH_CETAK: "Sudah Dicetak",
  };

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL_VALUE || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key === "fakultasId") {
      params.delete("programStudiId");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Select
        items={fakultasItems}
        value={currentFakultasId || ALL_VALUE}
        onValueChange={(v) => updateParam("fakultasId", v ?? "")}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Semua Fakultas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Semua Fakultas</SelectItem>
          {fakultasOptions.map((fakultas) => (
            <SelectItem key={fakultas.id} value={String(fakultas.id)}>
              {fakultas.nama}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={programStudiItems}
        value={currentProgramStudiId || ALL_VALUE}
        onValueChange={(v) => updateParam("programStudiId", v ?? "")}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Semua Program Studi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Semua Program Studi</SelectItem>
          {filteredProgramStudi.map((prodi) => (
            <SelectItem key={prodi.id} value={String(prodi.id)}>
              {prodi.nama}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={statusItems}
        value={currentStatus || ALL_VALUE}
        onValueChange={(v) => updateParam("statusCetak", v ?? "")}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Semua Status</SelectItem>
          <SelectItem value="BELUM_CETAK">Belum Dicetak</SelectItem>
          <SelectItem value="SUDAH_CETAK">Sudah Dicetak</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
