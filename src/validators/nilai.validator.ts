import { z } from "zod";

export const nilaiQuerySchema = z.object({
  npm: z.string({ error: "NPM wajib diisi" }).min(1, { error: "NPM wajib diisi" }),
});

export type NilaiQuery = z.infer<typeof nilaiQuerySchema>;
