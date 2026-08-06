# Cetak Transkrip — Sistem Manajemen Transkrip Akademik

Aplikasi web untuk mengelola data akademik dan mencetak transkrip mahasiswa. Merupakan penulisan
ulang (rewrite) dari aplikasi Laravel 8 lama ke stack modern dengan arsitektur berlapis, autentikasi
yang aman, dan pembuatan PDF sungguhan.

---

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Arsitektur](#arsitektur)
- [Struktur Folder](#struktur-folder)
- [Model Data](#model-data)
- [Integrasi SIMAKAD](#integrasi-simakad)
- [Autentikasi & Hak Akses](#autentikasi--hak-akses)
- [Daftar API](#daftar-api)
- [Deployment](#deployment)
- [Catatan Migrasi dari Sistem Lama](#catatan-migrasi-dari-sistem-lama)

---

## Tech Stack

| Lapisan | Teknologi |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19 |
| Bahasa | TypeScript (mode `strict`) |
| Styling | Tailwind CSS v4, shadcn/ui, Lucide Icons |
| Database | PostgreSQL 17 |
| ORM | Prisma 7 (generator `prisma-client` + driver adapter `@prisma/adapter-pg`) |
| Validasi | Zod 4 (server & client), React Hook Form |
| Tabel | TanStack Table v9 |
| Autentikasi | JWT via `jose` (kompatibel Edge runtime), `bcryptjs` |
| PDF | `@react-pdf/renderer` |
| Excel | `exceljs` |
| Scraping | `cheerio` |
| Tema | `next-themes` (dark/light) |
| Kualitas kode | ESLint + Prettier |

---

## Prasyarat

- **Node.js 20 atau lebih baru** (dikembangkan & diuji pada Node 22.17.0).
  Next.js 15 tidak mendukung Node 18.17 ke bawah.
- **PostgreSQL 17** yang dapat diakses (lokal maupun kontainer Docker).

---

## Instalasi

```bash
# 1. Pasang dependensi
npm install

# 2. Siapkan environment variable
cp .env.example .env
# lalu sesuaikan isinya (lihat tabel di bawah)

# 3. Jalankan migrasi database
npx prisma migrate deploy      # produksi
# atau, untuk pengembangan:
npx prisma migrate dev

# 4. Generate Prisma Client
#    (Prisma 7 TIDAK lagi menjalankan generate otomatis setelah migrate)
npx prisma generate

# 5. Isi data awal (admin, setting default, contoh data)
npx prisma db seed
```

### Environment Variable

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | ya | Connection string PostgreSQL. **Karakter khusus pada password wajib di-URL-encode** (`#` → `%23`, `@` → `%40`, `:` → `%3A`) — bila tidak, URL terpotong dan koneksi gagal |
| `DIRECT_URL` | opsional | Koneksi non-pooler khusus `prisma migrate`. Lihat catatan Supabase di bawah |
| `JWT_SECRET` | ya | Kunci penandatangan JWT. Buat dengan `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `BCRYPT_SALT_ROUNDS` | tidak | Default `12` |
| `SESSION_COOKIE_NAME` | tidak | Default `transkrip_session` |
| `DEFAULT_ADMIN_USERNAME` | tidak | Hanya dipakai oleh skrip seed. Default `admin` |
| `DEFAULT_ADMIN_PASSWORD` | tidak | Hanya dipakai oleh skrip seed. Default `123456789` |

> **Penting:** ganti password admin default segera setelah login pertama melalui halaman
> **Profil Saya → Ubah Password**.

### Akun Default

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `123456789` | ADMIN |

### Catatan khusus Supabase (atau PostgreSQL di balik PgBouncer)

Supabase menyediakan dua endpoint:

| Endpoint | Port | Kegunaan |
| --- | --- | --- |
| Transaction pooler | `6543` | Runtime aplikasi (`DATABASE_URL`) |
| Session pooler / direct | `5432` | `prisma migrate` (`DIRECT_URL`) |

`prisma migrate` membutuhkan advisory lock dan prepared statement yang **tidak tersedia** pada
transaction pooler — bila dijalankan lewat port 6543, perintahnya akan menggantung tanpa pesan error.

Jika port 5432 dapat dijangkau, jalankan migrasi seperti biasa:

```bash
npx prisma migrate deploy
```

Jika port 5432 **diblokir** (umum pada jaringan kantor yang hanya mengizinkan port tertentu), gunakan
skrip pendamping berikut. Skrip ini menjalankan file `migration.sql` apa adanya lewat koneksi pooler,
lalu mencatatnya ke tabel `_prisma_migrations` sehingga status migrasi tetap sinkron dengan Prisma:

```bash
node tools/apply-migrations-pooler.mjs
npx prisma db seed
```

---

## Menjalankan Aplikasi

```bash
npm run dev       # mode pengembangan (http://localhost:3000)
npm run build     # build produksi
npm start         # jalankan hasil build
npm run lint      # ESLint
npx tsc --noEmit  # pemeriksaan tipe
```

---

## Arsitektur

Aplikasi memakai pemisahan lapisan yang tegas. **Aturan utama: route handler dan halaman hanya
boleh memanggil `services/`, tidak pernah langsung ke `repositories/`.** Dengan begitu setiap aturan
bisnis punya satu tempat tinggal saja.

```
Route Handler / Page  (validasi Zod, autentikasi, bentuk respons)
        ↓
    Services          (aturan bisnis: hitung IPK & predikat, guard, orkestrasi)
        ↓
  Repositories        (akses data: Prisma, dan scraper SIMAKAD)
        ↓
  PostgreSQL / SIMAKAD
```

Prinsip lain yang dipegang:

- **Soft delete** untuk seluruh master data (`deletedAt`), bukan hapus permanen.
- **Tidak ada `@unique` di level database.** Keunikan (nama fakultas, NPM, username, dsb.)
  divalidasi di service dengan filter `deletedAt: null`. Alasannya: constraint unik PostgreSQL tetap
  berlaku untuk baris yang sudah di-soft-delete, sehingga nama yang pernah dihapus tidak akan pernah
  bisa dipakai lagi — perilaku yang salah untuk aplikasi ini.
- **Tabel append-only** untuk `Transkrip` dan `ActivityLog`. Transkrip dibatalkan dengan status
  `VOID`, bukan dihapus, agar jejak audit tetap utuh.
- **Foreign key `Restrict`/`SetNull`**, tidak pernah `Cascade` — menghapus mahasiswa atau user tidak
  boleh menghapus riwayat cetak.

---

## Struktur Folder

```
prisma/
  schema.prisma            model, enum, index
  seed.ts                  data awal (idempoten, aman dijalankan berulang)
  migrations/
src/
  app/
    (auth)/login/          halaman login
    (dashboard)/           seluruh halaman terautentikasi
    api/                   REST API per entitas
    not-found.tsx          halaman 404
    error.tsx              error boundary global
  components/
    ui/                    primitif shadcn/ui
    data-table/            pembungkus TanStack Table (search, sort, paginate)
    feedback/              EmptyState, ErrorState, LoadingButton, ConfirmDeleteDialog, Skeleton
    layout/                Sidebar, Header, Footer, Breadcrumb, UserMenu
  features/                UI per domain (mahasiswa, transkrip, user, dst.)
    transkrip/pdf/         template PDF transkrip
  services/                aturan bisnis
  repositories/            akses data (Prisma + scraper SIMAKAD)
  lib/                     prisma client, auth, api envelope, rate limit, format
  validators/              skema Zod (dipakai bersama server & client)
  hooks/  types/  utils/
```

### Aturan penempatan komponen

- `components/` — tidak tahu domain sama sekali, bisa disalin ke proyek lain.
- `features/` — mengenal model domain, skema Zod, dan tipe Prisma.

Patokan praktis: jika sebuah komponen meng-import skema Zod domain atau tipe Prisma, tempatnya di
`features/`.

---

## Model Data

| Model | Peran |
| --- | --- |
| `User` | Akun sistem, role `ADMIN`/`OPERATOR`, password bcrypt |
| `Fakultas` | Fakultas beserta nama dekan (tercetak di blok tanda tangan transkrip) |
| `ProgramStudi` | Program studi, FK ke `Fakultas`, punya `jenjang` (D3–S3, Profesi) |
| `Mahasiswa` | Biodata mahasiswa, FK ke `Fakultas` & `ProgramStudi`, status cetak |
| `Akreditasi` | Akreditasi institusi. Hanya satu baris boleh `isActive` |
| `Transkrip` | **Log cetak + snapshot.** Menyimpan IPK, total SKS, predikat, serta salinan JSON biodata dan daftar mata kuliah pada saat dicetak |
| `Setting` | Konfigurasi key/value (identitas institusi, URL SIMAKAD, ambang predikat, dsb.) |
| `ActivityLog` | Jejak audit append-only: siapa melakukan apa dan kapan |

### Mengapa `Transkrip` menyimpan snapshot

Nilai mahasiswa tidak disimpan di database ini (lihat bagian berikutnya). Karena itu setiap transkrip
yang dicetak menyimpan salinan lengkap datanya. Konsekuensinya:

- **Cetak ulang tidak pernah menghubungi SIMAKAD lagi** — riwayat tetap bisa dicetak meski SIMAKAD
  sedang mati atau data mahasiswa di sana berubah.
- Transkrip lama tetap memperlihatkan data persis seperti saat pertama diterbitkan.

---

## Integrasi SIMAKAD

Data mata kuliah, nilai, SKS, dan IPK **tidak disimpan di aplikasi ini**. Semuanya diambil langsung
(live) dari sistem SIMAKAD eksternal saat dibutuhkan — mempertahankan pola sistem lama, namun
ditulis ulang di Node/TypeScript memakai `cheerio`.

- Implementasi: `src/repositories/nilai.repository.ts`
- Berada di balik antarmuka `INilaiRepository`, sehingga sumber data bisa diganti (misalnya kelak
  SIMAKAD menyediakan API JSON) tanpa menyentuh service maupun UI.
- Base URL dan timeout dikonfigurasi lewat halaman **Setting**, bukan hardcode.

### Perilaku saat SIMAKAD bermasalah

Kesalahan dibedakan dengan tipe agar pesan ke pengguna tepat:

| Tipe | HTTP | Arti |
| --- | --- | --- |
| `ScraperTimeoutError` | 504 | Melebihi batas waktu tunggu |
| `ScraperUnavailableError` | 502 | Tidak dapat dihubungi / status non-200 |
| `ScraperParseError` | 502 | Struktur halaman SIMAKAD berubah (butuh perbaikan kode) |

Yang **tetap berjalan normal** meski SIMAKAD mati: seluruh CRUD, melihat riwayat transkrip, dan
**cetak ulang transkrip lama**. Yang terhenti hanya pencarian nilai dan pencetakan transkrip baru.

### Menguji tanpa SIMAKAD asli

Repo ini menyertakan server fixture yang meniru struktur halaman SIMAKAD, sehingga fitur Nilai dan
Cetak Transkrip bisa dicoba tanpa akses ke sistem produksi:

```bash
npm run simakad:fixture     # berjalan di http://localhost:4310
```

Lalu ubah **Base URL SIMAKAD** di halaman Setting menjadi `http://localhost:4310`. Gunakan NPM
mahasiswa hasil seed (misalnya `2019010001`). NPM khusus `NOTFOUND` akan mengembalikan halaman tanpa
elemen ringkasan — berguna untuk menguji penanganan `ScraperParseError`.

> Jangan lupa mengembalikan Base URL ke SIMAKAD produksi sebelum dipakai sungguhan.

Endpoint yang dipanggil aplikasi:

```
GET {simakad_base_url}/Cetak/TranscriptAkhir?Nim={npm}
```

Halaman tersebut harus memuat tabel `table.table.striping` (kolom berurutan: kode MK, nama MK, huruf
mutu, angka mutu, SKS, bobot×SKS) serta tiga elemen dengan id `#bbtXjmlSksSmst`, `#jmlh_sks_bernilai`,
dan `#IP` yang nilainya berada di atribut `value`.

---

## Autentikasi & Hak Akses

- **JWT** ditandatangani dengan `jose` (HS256) dan disimpan pada cookie `httpOnly`, `sameSite=lax`,
  `secure` di produksi. Masa berlaku 8 jam, atau 30 hari bila "Ingat saya" dicentang.
- **Dua lapis pemeriksaan.** `middleware.ts` (Edge runtime) hanya memverifikasi tanda tangan dan masa
  berlaku token secara stateless — cepat, tapi **bukan** batas keamanan sesungguhnya. Setiap route
  dan halaman memanggil `requireUser()` / `requireRole()` yang memeriksa ulang status `isActive` dan
  role langsung ke database.
- **Rate limit login**: 8 percobaan per 5 menit per alamat IP.

### Matriks hak akses

| Kemampuan | ADMIN | OPERATOR |
| --- | :---: | :---: |
| Dashboard, Mahasiswa, Fakultas, Program Studi, Akreditasi | ✅ | ✅ |
| Lihat Nilai, cetak & lihat Transkrip | ✅ | ✅ |
| Batalkan (void) transkrip | ✅ | ❌ |
| Halaman & API Setting | ✅ | ❌ |
| Manajemen User | ✅ | ❌ |

Pengaman tambahan pada manajemen user: admin tidak dapat menghapus maupun menonaktifkan akunnya
sendiri, dan sistem menolak tindakan yang akan menyisakan nol administrator aktif.

---

## Daftar API

Seluruh respons memakai amplop yang konsisten:

```json
{ "success": true, "message": "Data berhasil disimpan", "data": {} }
```

| Endpoint | Method | Akses |
| --- | --- | --- |
| `/api/auth/login`, `/logout`, `/me` | POST, POST, GET | publik / terautentikasi |
| `/api/mahasiswa` `/[id]` | GET POST PUT DELETE | terautentikasi |
| `/api/mahasiswa/import` | POST | terautentikasi |
| `/api/mahasiswa/export`, `/export-pdf` | GET | terautentikasi |
| `/api/fakultas` `/[id]` | GET POST PUT DELETE | terautentikasi |
| `/api/prodi` `/[id]` | GET POST PUT DELETE | terautentikasi |
| `/api/akreditasi` `/[id]` `/[id]/activate` | GET POST PUT DELETE | terautentikasi |
| `/api/nilai?npm=` | GET | terautentikasi (live SIMAKAD) |
| `/api/transkrip` `/[id]` | GET | terautentikasi |
| `/api/transkrip/preview`, `/preview-pdf` | GET | terautentikasi |
| `/api/transkrip/generate` | POST | terautentikasi |
| `/api/transkrip/[id]/pdf` | GET | terautentikasi |
| `/api/transkrip/[id]/void` | POST | **ADMIN** |
| `/api/setting` | GET PUT | **ADMIN** |
| `/api/user` `/[id]` `/[id]/toggle-active` | GET POST PUT DELETE | **ADMIN** |
| `/api/profile`, `/profile/change-password` | PUT, POST | terautentikasi |

Kode status: `400` input tidak valid, `401` belum login, `403` tidak berhak, `404` tidak ditemukan,
`409` bentrok aturan bisnis, `422` validasi Zod gagal, `429` terlalu banyak percobaan,
`502`/`504` gangguan SIMAKAD.

---

## Deployment

```bash
npm ci
npx prisma migrate deploy
npx prisma generate
npm run build
npm start
```

Checklist sebelum go-live:

1. `JWT_SECRET` diisi nilai acak yang kuat dan berbeda dari lingkungan pengembangan.
2. `NODE_ENV=production` agar cookie sesi memakai flag `secure`.
3. Aplikasi dilayani melalui **HTTPS** (cookie `secure` tidak terkirim lewat HTTP).
4. `simakad_base_url` pada halaman Setting sudah menunjuk ke SIMAKAD produksi.
5. Password admin default sudah diganti.
6. Backup database terjadwal — tabel `Transkrip` berisi arsip cetak yang tidak dapat dibuat ulang
   apabila SIMAKAD sudah tidak menyimpan data lamanya.

---

## Catatan Migrasi dari Sistem Lama

Perbedaan yang disengaja terhadap aplikasi Laravel sebelumnya:

| Aspek | Sistem lama | Sistem ini |
| --- | --- | --- |
| Login | Hanya mencocokkan "kode akses"; kolom password tidak pernah diperiksa | Username + password bcrypt yang diverifikasi |
| Hak akses | Hanya disembunyikan di sisi klien (`localStorage`) | Diperiksa di server pada setiap route dan halaman |
| Fakultas & Prodi | Satu tabel, dibedakan kolom `label`, relasi berupa teks bebas | Dua tabel terpisah dengan foreign key sungguhan |
| Cetak transkrip | HTML + CSS `@media print`, tanpa library PDF | PDF sungguhan (`@react-pdf/renderer`), kertas F4, font Courier |
| Riwayat cetak | Tidak ada | Tabel `Transkrip` berisi snapshot lengkap |
| Predikat kelulusan | Diketik manual per mahasiswa | Dihitung otomatis dari IPK, ambangnya dapat diatur |
| Jejak audit | Tidak ada | `ActivityLog` mencatat setiap aksi penting |
| Export | Tidak ada | Export Excel & PDF untuk daftar mahasiswa |

Tata letak transkrip yang dicetak sengaja dipertahankan sama dengan sistem lama: ukuran kertas F4
(210×330 mm), margin atas 4,5 cm untuk kop surat pra-cetak, font monospace, tujuh kolom tabel nilai
(No, Kode MK, Mata Kuliah, HM, AM, K, M), blok keterangan, serta blok tanda tangan dekan.
