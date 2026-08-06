import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

export const fakultasQuerySchema = paginationQuerySchema.extend({
  sortBy: z.enum(["nama", "kode", "dekan", "createdAt"]).optional().default("nama"),
});

export type FakultasQuery = z.infer<typeof fakultasQuerySchema>;

export const fakultasFormSchema = z.object({
  nama: z
    .string({ error: "Nama fakultas wajib diisi" })
    .min(1, { error: "Nama fakultas wajib diisi" })
    .max(255, { error: "Nama fakultas maksimal 255 karakter" }),
  kode: z.string().max(20, { error: "Kode maksimal 20 karakter" }).optional(),
  dekan: z
    .string({ error: "Nama dekan wajib diisi" })
    .min(1, { error: "Nama dekan wajib diisi" })
    .max(255, { error: "Nama dekan maksimal 255 karakter" }),
});

export type FakultasFormInput = z.infer<typeof fakultasFormSchema>;
