"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import {
  settingFormSchema,
  type SettingFormInput,
  type SettingFormOutput,
} from "@/validators/setting.validator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton } from "@/components/feedback/loading-button";
import type { ApiEnvelope } from "@/lib/api/response";
import type { EditableSettings } from "@/services/setting.service";

interface SettingFormProps {
  settings: EditableSettings;
}

export function SettingForm({ settings }: SettingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SettingFormInput, unknown, SettingFormOutput>({
    resolver: zodResolver(settingFormSchema),
    defaultValues: {
      institution_name: settings.institution_name,
      institution_address: settings.institution_address,
      simakad_base_url: settings.simakad_base_url,
      scrape_timeout_ms: settings.scrape_timeout_ms,
      predikat_thresholds: settings.predikat_thresholds,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "predikat_thresholds",
  });

  async function onSubmit(values: SettingFormOutput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/setting", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json: ApiEnvelope<unknown> = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal menyimpan pengaturan");
        return;
      }

      toast.success("Pengaturan berhasil disimpan");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Identitas Institusi</CardTitle>
            <CardDescription>
              Informasi ini ditampilkan pada dokumen transkrip yang dicetak.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="institution_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Institusi</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="institution_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Institusi</FormLabel>
                  <FormControl>
                    <Textarea disabled={isSubmitting} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrasi SIMAKAD</CardTitle>
            <CardDescription>
              Sumber data nilai dan IPK diambil secara langsung dari sistem SIMAKAD eksternal.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="simakad_base_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base URL SIMAKAD</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://simakad.contoh.ac.id"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Tanpa tanda / di akhir. Endpoint transkrip akan ditambahkan otomatis.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scrape_timeout_ms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeout (ms)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={isSubmitting}
                      {...field}
                      value={
                        field.value === undefined || field.value === null ? "" : String(field.value)
                      }
                    />
                  </FormControl>
                  <FormDescription>Batas waktu tunggu respons SIMAKAD.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predikat Kelulusan</CardTitle>
            <CardDescription>
              Predikat dihitung otomatis dari IPK. Perubahan hanya berlaku untuk transkrip yang
              dicetak setelah pengaturan disimpan.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {fields.map((fieldItem, index) => (
              <div key={fieldItem.id} className="grid gap-3 sm:grid-cols-[1fr_120px_120px_auto]">
                <FormField
                  control={form.control}
                  name={`predikat_thresholds.${index}.label`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 ? <FormLabel>Label Predikat</FormLabel> : null}
                      <FormControl>
                        <Input disabled={isSubmitting} {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`predikat_thresholds.${index}.minIpk`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 ? <FormLabel>IPK Min</FormLabel> : null}
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          disabled={isSubmitting}
                          {...field}
                          value={
                            field.value === undefined || field.value === null
                              ? ""
                              : String(field.value)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`predikat_thresholds.${index}.maxIpk`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 ? <FormLabel>IPK Maks</FormLabel> : null}
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          disabled={isSubmitting}
                          {...field}
                          value={
                            field.value === undefined || field.value === null
                              ? ""
                              : String(field.value)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className={index === 0 ? "flex items-end pb-0.5" : "flex items-start"}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={isSubmitting || fields.length <= 1}
                    onClick={() => remove(index)}
                    aria-label="Hapus ambang predikat"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              disabled={isSubmitting}
              onClick={() => append({ label: "", minIpk: 0, maxIpk: 0 })}
            >
              <Plus />
              Tambah Ambang
            </Button>

            {form.formState.errors.predikat_thresholds?.root ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.predikat_thresholds.root.message}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <LoadingButton type="submit" isLoading={isSubmitting}>
            Simpan Pengaturan
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
