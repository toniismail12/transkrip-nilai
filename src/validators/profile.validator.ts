import { z } from "zod";

export const profileFormSchema = z.object({
  name: z
    .string({ error: "Nama wajib diisi" })
    .min(1, { error: "Nama wajib diisi" })
    .max(255, { error: "Nama maksimal 255 karakter" }),
  email: z.email({ error: "Format email tidak valid" }).max(255).optional().or(z.literal("")),
});

export type ProfileFormInput = z.input<typeof profileFormSchema>;
export type ProfileFormOutput = z.output<typeof profileFormSchema>;
