import { z } from "zod";

export const transkripQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type TranskripListQuery = z.infer<typeof transkripQuerySchema>;

export const generateTranskripSchema = z.object({
  npm: z.string({ error: "NPM wajib diisi" }).min(1, { error: "NPM wajib diisi" }),
  noSeri: z.string().max(50, { error: "Nomor seri maksimal 50 karakter" }).optional(),
});

export type GenerateTranskripInput = z.input<typeof generateTranskripSchema>;
export type GenerateTranskripOutput = z.output<typeof generateTranskripSchema>;

export const voidTranskripSchema = z.object({
  reason: z
    .string({ error: "Alasan pembatalan wajib diisi" })
    .min(1, { error: "Alasan pembatalan wajib diisi" })
    .max(255, { error: "Alasan maksimal 255 karakter" }),
});

export type VoidTranskripInput = z.infer<typeof voidTranskripSchema>;
