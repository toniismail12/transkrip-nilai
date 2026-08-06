import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

export const userQuerySchema = paginationQuerySchema.extend({
  sortBy: z.enum(["username", "name", "role", "createdAt"]).optional().default("name"),
  role: z.enum(["ADMIN", "OPERATOR"]).optional(),
});

export type UserQuery = z.infer<typeof userQuerySchema>;

export const userCreateSchema = z.object({
  username: z
    .string({ error: "Username wajib diisi" })
    .min(1, { error: "Username wajib diisi" })
    .max(50, { error: "Username maksimal 50 karakter" })
    .regex(/^\S+$/, { error: "Username tidak boleh mengandung spasi" }),
  name: z
    .string({ error: "Nama wajib diisi" })
    .min(1, { error: "Nama wajib diisi" })
    .max(255, { error: "Nama maksimal 255 karakter" }),
  email: z.email({ error: "Format email tidak valid" }).optional().or(z.literal("")),
  password: z
    .string({ error: "Password wajib diisi" })
    .min(8, { error: "Password minimal 8 karakter" })
    .max(100, { error: "Password maksimal 100 karakter" }),
  role: z.enum(["ADMIN", "OPERATOR"], { error: "Role wajib dipilih" }),
});

export type UserCreateInput = z.input<typeof userCreateSchema>;
export type UserCreateOutput = z.output<typeof userCreateSchema>;

export const userUpdateSchema = userCreateSchema.extend({
  password: z
    .string()
    .min(8, { error: "Password minimal 8 karakter" })
    .max(100, { error: "Password maksimal 100 karakter" })
    .optional()
    .or(z.literal("")),
});

export type UserUpdateInput = z.input<typeof userUpdateSchema>;
export type UserUpdateOutput = z.output<typeof userUpdateSchema>;

export const toggleUserActiveSchema = z.object({
  isActive: z.boolean({ error: "Status aktif wajib diisi" }),
});

export type ToggleUserActiveInput = z.infer<typeof toggleUserActiveSchema>;
