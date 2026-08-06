import { z } from "zod";

export const predikatThresholdSchema = z.object({
  label: z
    .string({ error: "Label predikat wajib diisi" })
    .min(1, { error: "Label predikat wajib diisi" })
    .max(100),
  minIpk: z.coerce
    .number({ error: "IPK minimum wajib berupa angka" })
    .min(0, { error: "IPK minimum tidak boleh kurang dari 0" })
    .max(4, { error: "IPK minimum tidak boleh lebih dari 4" }),
  maxIpk: z.coerce
    .number({ error: "IPK maksimum wajib berupa angka" })
    .min(0, { error: "IPK maksimum tidak boleh kurang dari 0" })
    .max(4, { error: "IPK maksimum tidak boleh lebih dari 4" }),
});

export const settingFormSchema = z
  .object({
    institution_name: z
      .string({ error: "Nama institusi wajib diisi" })
      .min(1, { error: "Nama institusi wajib diisi" })
      .max(255),
    institution_address: z.string().max(500).optional().or(z.literal("")),
    simakad_base_url: z
      .url({ error: "URL SIMAKAD tidak valid (contoh: https://simakad.contoh.ac.id)" })
      .max(255),
    scrape_timeout_ms: z.coerce
      .number({ error: "Timeout wajib berupa angka" })
      .int({ error: "Timeout harus bilangan bulat" })
      .min(1000, { error: "Timeout minimal 1000 ms" })
      .max(120000, { error: "Timeout maksimal 120000 ms" }),
    predikat_thresholds: z
      .array(predikatThresholdSchema)
      .min(1, { error: "Minimal satu ambang predikat" }),
  })
  .refine((data) => data.predikat_thresholds.every((item) => item.minIpk <= item.maxIpk), {
    error: "IPK minimum tidak boleh melebihi IPK maksimum",
    path: ["predikat_thresholds"],
  });

export type SettingFormInput = z.input<typeof settingFormSchema>;
export type SettingFormOutput = z.output<typeof settingFormSchema>;
