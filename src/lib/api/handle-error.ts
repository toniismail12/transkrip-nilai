import { z, ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { apiError } from "./response";

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return apiError("Data tidak valid", 422, z.treeifyError(error));
  }

  if (error instanceof AppError) {
    return apiError(error.message, error.status);
  }

  console.error(error);
  return apiError("Terjadi kesalahan pada server", 500);
}
