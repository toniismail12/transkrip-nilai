import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

export const akreditasiQuerySchema = paginationQuerySchema.extend({
  sortBy: z.enum(["nama", "isActive", "createdAt"]).optional().default("nama"),
});

export type AkreditasiQuery = z.infer<typeof akreditasiQuerySchema>;

export const akreditasiFormSchema = z.object({
  nama: z
    .string({ error: "Nama akreditasi wajib diisi" })
    .min(1, { error: "Nama akreditasi wajib diisi" })
    .max(255, { error: "Nama akreditasi maksimal 255 karakter" }),
  keterangan: z.string().max(500, { error: "Keterangan maksimal 500 karakter" }).optional(),
});

export type AkreditasiFormInput = z.infer<typeof akreditasiFormSchema>;
