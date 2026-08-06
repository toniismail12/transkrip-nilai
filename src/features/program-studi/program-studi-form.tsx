"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  programStudiFormSchema,
  type ProgramStudiFormInput,
  type ProgramStudiFormOutput,
} from "@/validators/program-studi.validator";
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
import type { ProgramStudi } from "@/generated/prisma/client";

const JENJANG_OPTIONS: { value: ProgramStudiFormOutput["jenjang"]; label: string }[] = [
  { value: "D3", label: "D3" },
  { value: "D4", label: "D4" },
  { value: "S1", label: "S1" },
  { value: "S2", label: "S2" },
  { value: "S3", label: "S3" },
  { value: "PROFESI", label: "Profesi" },
];

const JENJANG_ITEMS: Record<string, string> = Object.fromEntries(
  JENJANG_OPTIONS.map((option) => [option.value, option.label]),
);

interface ProgramStudiFormProps {
  programStudi?: ProgramStudi;
  fakultasOptions: { id: number; nama: string }[];
}

export function ProgramStudiForm({ programStudi, fakultasOptions }: ProgramStudiFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(programStudi);

  const form = useForm<ProgramStudiFormInput, unknown, ProgramStudiFormOutput>({
    resolver: zodResolver(programStudiFormSchema),
    defaultValues: {
      fakultasId: programStudi?.fakultasId ?? "",
      nama: programStudi?.nama ?? "",
      kode: programStudi?.kode ?? "",
      jenjang: programStudi?.jenjang ?? ("" as unknown as ProgramStudiFormInput["jenjang"]),
    },
  });

  const fakultasItems = useMemo(
    () => Object.fromEntries(fakultasOptions.map((f) => [String(f.id), f.nama])),
    [fakultasOptions],
  );

  async function onSubmit(values: ProgramStudiFormOutput) {
    setIsSubmitting(true);
    try {
      const res = await fetch(isEdit ? `/api/prodi/${programStudi!.id}` : "/api/prodi", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json: ApiEnvelope<unknown> = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal menyimpan data");
        return;
      }

      toast.success(
        isEdit ? "Program studi berhasil diperbarui" : "Program studi berhasil ditambahkan",
      );
      router.push("/program-studi");
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
            <CardTitle>{isEdit ? "Edit Program Studi" : "Tambah Program Studi"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fakultasId"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Fakultas</FormLabel>
                  <Select
                    items={fakultasItems}
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => field.onChange(Number(value))}
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
              name="nama"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nama Program Studi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Teknik Informatika"
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
              name="kode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="TI"
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
              name="jenjang"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenjang</FormLabel>
                  <Select
                    items={JENJANG_ITEMS}
                    value={field.value || ""}
                    onValueChange={(value) =>
                      field.onChange(value as ProgramStudiFormInput["jenjang"])
                    }
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih jenjang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {JENJANG_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
