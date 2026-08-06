import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

export const mahasiswaQuerySchema = paginationQuerySchema.extend({
  sortBy: z
    .enum(["npm", "nama", "tahunMasuk", "statusCetak", "createdAt"])
    .optional()
    .default("nama"),
  fakultasId: z.coerce.number().int().positive().optional(),
  programStudiId: z.coerce.number().int().positive().optional(),
  statusCetak: z.enum(["BELUM_CETAK", "SUDAH_CETAK"]).optional(),
});

export type MahasiswaQuery = z.infer<typeof mahasiswaQuerySchema>;

export const mahasiswaFormSchema = z.object({
  npm: z.string({ error: "NPM wajib diisi" }).min(1, { error: "NPM wajib diisi" }).max(30),
  nama: z.string({ error: "Nama wajib diisi" }).min(1, { error: "Nama wajib diisi" }).max(255),
  tempatLahir: z
    .string({ error: "Tempat lahir wajib diisi" })
    .min(1, { error: "Tempat lahir wajib diisi" })
    .max(100),
  tanggalLahir: z.iso.date({ error: "Tanggal lahir wajib diisi dengan format yang benar" }),
  tahunMasuk: z.coerce
    .number({ error: "Tahun masuk wajib diisi" })
    .int({ error: "Tahun masuk tidak valid" })
    .min(1945, { error: "Tahun masuk tidak valid" })
    .max(2100, { error: "Tahun masuk tidak valid" }),
  fakultasId: z.coerce.number({ error: "Fakultas wajib dipilih" }).int().positive(),
  programStudiId: z.coerce.number({ error: "Program studi wajib dipilih" }).int().positive(),
  tanggalLulus: z.iso.date({ error: "Format tanggal tidak valid" }).optional().or(z.literal("")),
  judulSkripsi: z.string().max(500, { error: "Judul skripsi maksimal 500 karakter" }).optional(),
  konsentrasi: z.string().max(100, { error: "Konsentrasi maksimal 100 karakter" }).optional(),
  noIjazah: z.string().max(50, { error: "Nomor ijazah maksimal 50 karakter" }).optional(),
  noSeri: z.string().max(50, { error: "Nomor seri maksimal 50 karakter" }).optional(),
  tglSkDekan: z.iso.date({ error: "Format tanggal tidak valid" }).optional().or(z.literal("")),
});

export type MahasiswaFormInput = z.input<typeof mahasiswaFormSchema>;
export type MahasiswaFormOutput = z.output<typeof mahasiswaFormSchema>;
