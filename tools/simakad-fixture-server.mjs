/**
 * Server fixture SIMAKAD untuk pengembangan & demo.
 *
 * Meniru struktur HTML halaman transkrip SIMAKAD yang di-scrape oleh
 * `src/repositories/nilai.repository.ts`, sehingga fitur Nilai dan Cetak Transkrip
 * bisa dijalankan tanpa akses ke SIMAKAD produksi.
 *
 * Cara pakai:
 *   node tools/simakad-fixture-server.mjs
 *   lalu set "Base URL SIMAKAD" di halaman Setting ke http://localhost:4310
 *
 * NPM khusus:
 *   NOTFOUND -> mengembalikan halaman tanpa elemen ringkasan, untuk menguji
 *               penanganan ScraperParseError.
 */
import http from "node:http";

const PORT = Number(process.env.FIXTURE_PORT ?? 4310);

const COURSES = [
  ["TI101", "Algoritma dan Pemrograman", "A", 4, 3, 12],
  ["TI102", "Struktur Data", "A", 4, 3, 12],
  ["TI103", "Basis Data", "B", 3, 3, 9],
  ["TI201", "Pemrograman Web", "A", 4, 3, 12],
  ["TI202", "Jaringan Komputer", "B", 3, 2, 6],
  ["TI301", "Rekayasa Perangkat Lunak", "A", 4, 3, 12],
  ["TI302", "Kecerdasan Buatan", "B", 3, 3, 9],
  ["TI401", "Metodologi Penelitian", "A", 4, 2, 8],
  ["TI402", "Kerja Praktik", "A", 4, 2, 8],
  ["TI999", "Skripsi", "A", 4, 6, 24],
];

const totalSks = COURSES.reduce((sum, row) => sum + row[4], 0);
const totalBobot = COURSES.reduce((sum, row) => sum + row[5], 0);
const ipk = (totalBobot / totalSks).toFixed(2).replace(".", ",");

function renderTranscriptPage() {
  const rows = COURSES.map(
    ([kode, nama, hm, am, sks, bobot]) =>
      `<tr><td>${kode}</td><td>${nama}</td><td>${hm}</td><td>${am}</td><td>${sks}</td><td>${bobot}</td></tr>`,
  ).join("\n      ");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>SIMAKAD Fixture</title></head>
<body>
  <table class="table striping">
    <thead>
      <tr><th>Kode</th><th>Nama</th><th>HM</th><th>AM</th><th>SKS</th><th>M</th></tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <input type="hidden" id="bbtXjmlSksSmst" value="${totalBobot}" />
  <input type="hidden" id="jmlh_sks_bernilai" value="${totalSks}" />
  <input type="hidden" id="IP" value="${ipk}" />
</body>
</html>`;
}

const BROKEN_PAGE = `<!DOCTYPE html>
<html><body><p>Data tidak ditemukan</p></body></html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const nim = url.searchParams.get("Nim");

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(nim === "NOTFOUND" ? BROKEN_PAGE : renderTranscriptPage());
});

server.listen(PORT, () => {
  console.log(`SIMAKAD fixture berjalan di http://localhost:${PORT}`);
  console.log(`Endpoint: /Cetak/TranscriptAkhir?Nim={npm}`);
});
