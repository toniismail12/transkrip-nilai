export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Belum login atau sesi telah berakhir") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Anda tidak memiliki akses untuk aksi ini") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Data tidak ditemukan") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Data tidak dapat diproses karena masih digunakan") {
    super(message, 409);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Permintaan tidak valid") {
    super(message, 400);
  }
}
