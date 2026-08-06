/**
 * Menerapkan migrasi Prisma melalui koneksi PgBouncer transaction-mode.
 *
 * Latar belakang: `prisma migrate deploy` membutuhkan advisory lock dan
 * prepared statement yang tidak tersedia pada pooler transaction mode
 * (port 6543). Bila host Supabase direct (port 5432) tidak dapat dijangkau —
 * misalnya diblokir firewall jaringan kantor — perintah tersebut akan
 * menggantung. Skrip ini menjalankan file migration.sql apa adanya, lalu
 * mencatatnya ke tabel `_prisma_migrations` sehingga Prisma tetap menganggap
 * migrasi sudah diterapkan.
 *
 * Pakai `npx prisma migrate deploy` bila koneksi direct tersedia. Skrip ini
 * hanya jalan keluar ketika koneksi direct tidak memungkinkan.
 *
 * Cara pakai: node tools/apply-migrations-pooler.mjs
 */
import "dotenv/config";
import { createHash, randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "prisma", "migrations");

const CREATE_HISTORY_TABLE = `
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  id                      VARCHAR(36) PRIMARY KEY NOT NULL,
  checksum                VARCHAR(64) NOT NULL,
  finished_at             TIMESTAMPTZ,
  migration_name          VARCHAR(255) NOT NULL,
  logs                    TEXT,
  rolled_back_at          TIMESTAMPTZ,
  started_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_steps_count     INTEGER NOT NULL DEFAULT 0
);`;

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30000,
});

await client.connect();
console.log("Terhubung ke database.\n");

await client.query(CREATE_HISTORY_TABLE);

const applied = new Set(
  (await client.query('SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL')).rows.map(
    (r) => r.migration_name,
  ),
);

const folders = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

let appliedCount = 0;

for (const name of folders) {
  if (applied.has(name)) {
    console.log(`- ${name} (sudah diterapkan, dilewati)`);
    continue;
  }

  const sql = readFileSync(path.join(migrationsDir, name, "migration.sql"), "utf-8");
  const checksum = createHash("sha256").update(sql).digest("hex");

  process.stdout.write(`- ${name} ... `);
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query(
      `INSERT INTO "_prisma_migrations"
         (id, checksum, migration_name, started_at, finished_at, applied_steps_count)
       VALUES ($1, $2, $3, now(), now(), 1)`,
      [randomUUID(), checksum, name],
    );
    await client.query("COMMIT");
    appliedCount += 1;
    console.log("OK");
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("GAGAL");
    console.error(`\n  ${error.message}\n`);
    await client.end();
    process.exit(1);
  }
}

const tables = await client.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1",
);

console.log(`\nSelesai. ${appliedCount} migrasi baru diterapkan.`);
console.log(`Tabel di schema public (${tables.rows.length}): ${tables.rows.map((r) => r.table_name).join(", ")}`);

await client.end();
