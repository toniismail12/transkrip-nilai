import { BadRequestError } from "@/lib/errors";

export function parseIdParam(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError("ID tidak valid");
  }
  return id;
}
