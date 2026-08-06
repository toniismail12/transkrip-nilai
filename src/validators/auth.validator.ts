import { z } from "zod";

export const loginSchema = z.object({
  username: z.string({ error: "Username wajib diisi" }).min(1, { error: "Username wajib diisi" }),
  password: z.string({ error: "Password wajib diisi" }).min(1, { error: "Password wajib diisi" }),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ error: "Password saat ini wajib diisi" }).min(1),
    newPassword: z
      .string({ error: "Password baru wajib diisi" })
      .min(8, { error: "Password baru minimal 8 karakter" }),
    confirmNewPassword: z.string({ error: "Konfirmasi password wajib diisi" }).min(1),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    error: "Konfirmasi password tidak cocok",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
