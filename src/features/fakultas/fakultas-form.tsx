"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { fakultasFormSchema, type FakultasFormInput } from "@/validators/fakultas.validator";
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
import { LoadingButton } from "@/components/feedback/loading-button";
import { Button } from "@/components/ui/button";
import type { ApiEnvelope } from "@/lib/api/response";
import type { Fakultas } from "@/generated/prisma/client";

interface FakultasFormProps {
  fakultas?: Fakultas;
}

export function FakultasForm({ fakultas }: FakultasFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(fakultas);

  const form = useForm<FakultasFormInput>({
    resolver: zodResolver(fakultasFormSchema),
    defaultValues: {
      nama: fakultas?.nama ?? "",
      kode: fakultas?.kode ?? "",
      dekan: fakultas?.dekan ?? "",
    },
  });

  async function onSubmit(values: FakultasFormInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch(isEdit ? `/api/fakultas/${fakultas!.id}` : "/api/fakultas", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json: ApiEnvelope<unknown> = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal menyimpan data");
        return;
      }

      toast.success(isEdit ? "Fakultas berhasil diperbarui" : "Fakultas berhasil ditambahkan");
      router.push("/fakultas");
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
            <CardTitle>{isEdit ? "Edit Fakultas" : "Tambah Fakultas"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nama Fakultas</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Fakultas Teknik"
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
                      placeholder="FT"
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
              name="dekan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dekan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Dr. Ir. Ahmad Kurniawan, M.T."
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
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
