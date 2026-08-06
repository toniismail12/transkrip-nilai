"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { akreditasiFormSchema, type AkreditasiFormInput } from "@/validators/akreditasi.validator";
import { Textarea } from "@/components/ui/textarea";
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
import type { Akreditasi } from "@/generated/prisma/client";

interface AkreditasiFormProps {
  akreditasi?: Akreditasi;
}

export function AkreditasiForm({ akreditasi }: AkreditasiFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(akreditasi);

  const form = useForm<AkreditasiFormInput>({
    resolver: zodResolver(akreditasiFormSchema),
    defaultValues: {
      nama: akreditasi?.nama ?? "",
      keterangan: akreditasi?.keterangan ?? "",
    },
  });

  async function onSubmit(values: AkreditasiFormInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch(isEdit ? `/api/akreditasi/${akreditasi!.id}` : "/api/akreditasi", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json: ApiEnvelope<unknown> = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal menyimpan data");
        return;
      }

      toast.success(isEdit ? "Akreditasi berhasil diperbarui" : "Akreditasi berhasil ditambahkan");
      router.push("/akreditasi");
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
            <CardTitle>{isEdit ? "Edit Akreditasi" : "Tambah Akreditasi"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Akreditasi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Unggul"
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
              name="keterangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Keterangan tambahan mengenai akreditasi ini"
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
