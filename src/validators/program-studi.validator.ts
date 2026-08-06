import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

export const programStudiQuerySchema = paginationQuerySchema.extend({
  sortBy: z.enum(["nama", "kode", "jenjang", "createdAt"]).optional().default("nama"),
});

export type ProgramStudiQuery = z.infer<typeof programStudiQuerySchema>;

export const programStudiFormSchema = z.object({
  fakultasId: z.coerce.number({ error: "Fakultas wajib dipilih" }).int().positive(),
  nama: z
    .string({ error: "Nama program studi wajib diisi" })
    .min(1, { error: "Nama program studi wajib diisi" })
    .max(255, { error: "Nama program studi maksimal 255 karakter" }),
  kode: z.string().max(20, { error: "Kode maksimal 20 karakter" }).optional(),
  jenjang: z.enum(["D3", "D4", "S1", "S2", "S3", "PROFESI"], { error: "Jenjang wajib dipilih" }),
});

export type ProgramStudiFormInput = z.input<typeof programStudiFormSchema>;
export type ProgramStudiFormOutput = z.output<typeof programStudiFormSchema>;
