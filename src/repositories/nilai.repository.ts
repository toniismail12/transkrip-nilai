import * as cheerio from "cheerio";
import { getScrapeTimeoutMs, getSimakadBaseUrl } from "@/services/setting.service";
import {
  ScraperParseError,
  ScraperTimeoutError,
  ScraperUnavailableError,
} from "@/lib/scraper-errors";

export interface ScrapedCourseRow {
  kodeMatakuliah: string;
  namaMatakuliah: string;
  hurufMutu: string;
  angkaMutu: number;
  sks: number;
  bobotSks: number;
}

export interface ScrapedNilaiResult {
  nim: string;
  courses: ScrapedCourseRow[];
  totalSksSemester: number;
  totalSksBernilai: number;
  ipk: number;
  scrapedAt: Date;
}

export interface INilaiRepository {
  getByNim(nim: string): Promise<ScrapedNilaiResult>;
}

function parseIndonesianNumber(raw: string): number {
  const cleaned = raw.trim().replace(/\./g, "").replace(",", ".");
  const value = parseFloat(cleaned);
  return Number.isNaN(value) ? 0 : value;
}

class SimakadHtmlScrapeRepository implements INilaiRepository {
  async getByNim(nim: string): Promise<ScrapedNilaiResult> {
    const [baseUrl, timeoutMs] = await Promise.all([getSimakadBaseUrl(), getScrapeTimeoutMs()]);
    const url = `${baseUrl}/Cetak/TranscriptAkhir?Nim=${encodeURIComponent(nim)}`;

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    let html: string;
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new ScraperUnavailableError();
      }
      html = await response.text();
    } catch (error) {
      if (error instanceof ScraperUnavailableError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new ScraperTimeoutError();
      }
      throw new ScraperUnavailableError();
    } finally {
      clearTimeout(timeoutHandle);
    }

    return this.parseHtml(nim, html);
  }

  parseHtml(nim: string, html: string): ScrapedNilaiResult {
    const $ = cheerio.load(html);

    const totalSksSemesterRaw = $("#bbtXjmlSksSmst").attr("value");
    const totalSksBernilaiRaw = $("#jmlh_sks_bernilai").attr("value");
    const ipkRaw = $("#IP").attr("value");

    if (
      totalSksSemesterRaw === undefined ||
      totalSksBernilaiRaw === undefined ||
      ipkRaw === undefined
    ) {
      throw new ScraperParseError();
    }

    const courses: ScrapedCourseRow[] = [];
    $("table.table.striping tbody tr").each((_, element) => {
      const cells = $(element).find("td");
      if (cells.length < 6) return;

      courses.push({
        kodeMatakuliah: $(cells.get(0)).text().trim(),
        namaMatakuliah: $(cells.get(1)).text().trim(),
        hurufMutu: $(cells.get(2)).text().trim(),
        angkaMutu: parseIndonesianNumber($(cells.get(3)).text()),
        sks: parseIndonesianNumber($(cells.get(4)).text()),
        bobotSks: parseIndonesianNumber($(cells.get(5)).text()),
      });
    });

    return {
      nim,
      courses,
      totalSksSemester: parseIndonesianNumber(totalSksSemesterRaw),
      totalSksBernilai: parseIndonesianNumber(totalSksBernilaiRaw),
      ipk: parseIndonesianNumber(ipkRaw),
      scrapedAt: new Date(),
    };
  }
}

export const nilaiRepository: INilaiRepository = new SimakadHtmlScrapeRepository();
