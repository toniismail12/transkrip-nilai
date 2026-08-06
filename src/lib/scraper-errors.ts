import { AppError } from "@/lib/errors";

export class ScraperError extends AppError {}

export class ScraperTimeoutError extends ScraperError {
  constructor(message = "Permintaan ke SIMAKAD melebihi batas waktu, coba lagi") {
    super(message, 504);
  }
}

export class ScraperUnavailableError extends ScraperError {
  constructor(message = "SIMAKAD sedang tidak dapat diakses, coba lagi nanti") {
    super(message, 502);
  }
}

export class ScraperParseError extends ScraperError {
  constructor(message = "Data nilai tidak ditemukan atau struktur halaman SIMAKAD berubah") {
    super(message, 502);
  }
}
