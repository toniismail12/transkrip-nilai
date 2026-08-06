"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  mahasiswaFormSchema,
  type MahasiswaFormInput,
  type MahasiswaFormOutput,
} from "@/validators/mahasiswa.validator";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingButton } from "@/components/feedback/loading-button";
import { Button } from "@/components/ui/button";
import type { ApiEnvelope } from "@/lib/api/response";
import type { Mahasiswa } from "@/generated/prisma/client";

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

interface FakultasOption {
  id: number;
  nama: string;
}

interface ProgramStudiOption {
  id: number;
  nama: string;
  fakultasId: number;
}

interface MahasiswaFormProps {
  mahasiswa?: Mahasiswa;
  fakultasOptions: FakultasOption[];
  programStudiOptions: ProgramStudiOption[];
}

export function MahasiswaForm({
  mahasiswa,
  fakultasOptions,
  programStudiOptions,
}: MahasiswaFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(mahasiswa);

  const form = useForm<MahasiswaFormInput, unknown, MahasiswaFormOutput>({
    resolver: zodResolver(mahasiswaFormSchema),
    defaultValues: {
      npm: mahasiswa?.npm ?? "",
      nama: mahasiswa?.nama ?? "",
      tempatLahir: mahasiswa?.tempatLahir ?? "",
      tanggalLahir: toDateInputValue(mahasiswa?.tanggalLahir),
      tahunMasuk: mahasiswa?.tahunMasuk ?? "",
      fakultasId: mahasiswa?.fakultasId ?? "",
      programStudiId: mahasiswa?.programStudiId ?? "",
      tanggalLulus: toDateInputValue(mahasiswa?.tanggalLulus),
      judulSkripsi: mahasiswa?.judulSkripsi ?? "",
      konsentrasi: mahasiswa?.konsentrasi ?? "",
      noIjazah: mahasiswa?.noIjazah ?? "",
      noSeri: mahasiswa?.noSeri ?? "",
      tglSkDekan: toDateInputValue(mahasiswa?.tglSkDekan),
    },
  });

  const selectedFakultasId = form.watch("fakultasId");

  const filteredProgramStudi = useMemo(() => {
    const fakultasId = Number(selectedFakultasId);
    if (!fakultasId) return [];
    return programStudiOptions.filter((prodi) => prodi.fakultasId === fakultasId);
  }, [programStudiOptions, selectedFakultasId]);

  const fakultasItems = useMemo(
    () => Object.fromEntries(fakultasOptions.map((f) => [String(f.id), f.nama])),
    [fakultasOptions],
  );

  const programStudiItems = useMemo(
    () => Object.fromEntries(filteredProgramStudi.map((p) => [String(p.id), p.nama])),
    [filteredProgramStudi],
  );

  async function onSubmit(values: MahasiswaFormOutput) {
    setIsSubmitting(true);
    try {
      const res = await fetch(isEdit ? `/api/mahasiswa/${mahasiswa!.id}` : "/api/mahasiswa", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json: ApiEnvelope<unknown> = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal menyimpan data");
        return;
      }

      toast.success(isEdit ? "Mahasiswa berhasil diperbarui" : "Mahasiswa berhasil ditambahkan");
      router.push("/mahasiswa");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? "Edit Mahasiswa" : "Tambah Mahasiswa"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="npm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NPM</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="2019010001"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Andi Pratama"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tempatLahir"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempat Lahir</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Palembang"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tanggalLahir"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Lahir</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tahunMasuk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahun Masuk</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2019"
                      disabled={isSubmitting}
                      {...field}
                      value={
                        field.value === undefined || field.value === null ? "" : String(field.value)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fakultasId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fakultas</FormLabel>
                  <Select
                    items={fakultasItems}
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                      form.setValue("programStudiId", "" as never);
                    }}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih fakultas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fakultasOptions.map((fakultas) => (
                        <SelectItem key={fakultas.id} value={String(fakultas.id)}>
                          {fakultas.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="programStudiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Studi</FormLabel>
                  <Select
                    items={programStudiItems}
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={isSubmitting || !selectedFakultasId}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih program studi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredProgramStudi.map((prodi) => (
                        <SelectItem key={prodi.id} value={String(prodi.id)}>
                          {prodi.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="konsentrasi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konsentrasi (opsional)</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tanggalLulus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Lulus (opsional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tglSkDekan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal SK Dekan (opsional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="noIjazah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No Ijazah (opsional)</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="noSeri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No Seri (opsional)</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="judulSkripsi"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Judul Skripsi (opsional)</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => router.back()}
            >
              Batal
            </Button>
            <LoadingButton type="submit" isLoading={isSubmitting}>
              Simpan
            </LoadingButton>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
