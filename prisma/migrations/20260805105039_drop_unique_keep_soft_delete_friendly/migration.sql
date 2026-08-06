-- DropIndex
DROP INDEX "fakultas_kode_key";

-- DropIndex
DROP INDEX "fakultas_nama_key";

-- DropIndex
DROP INDEX "mahasiswa_no_ijazah_key";

-- DropIndex
DROP INDEX "mahasiswa_no_seri_key";

-- DropIndex
DROP INDEX "mahasiswa_npm_key";

-- DropIndex
DROP INDEX "program_studi_id_fakultas_idx";

-- DropIndex
DROP INDEX "program_studi_id_fakultas_nama_key";

-- DropIndex
DROP INDEX "program_studi_kode_key";

-- DropIndex
DROP INDEX "user_email_key";

-- DropIndex
DROP INDEX "user_username_key";

-- CreateIndex
CREATE INDEX "fakultas_nama_idx" ON "fakultas"("nama");

-- CreateIndex
CREATE INDEX "fakultas_kode_idx" ON "fakultas"("kode");

-- CreateIndex
CREATE INDEX "mahasiswa_npm_idx" ON "mahasiswa"("npm");

-- CreateIndex
CREATE INDEX "mahasiswa_no_ijazah_idx" ON "mahasiswa"("no_ijazah");

-- CreateIndex
CREATE INDEX "mahasiswa_no_seri_idx" ON "mahasiswa"("no_seri");

-- CreateIndex
CREATE INDEX "program_studi_id_fakultas_nama_idx" ON "program_studi"("id_fakultas", "nama");

-- CreateIndex
CREATE INDEX "program_studi_kode_idx" ON "program_studi"("kode");

-- CreateIndex
CREATE INDEX "user_username_idx" ON "user"("username");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");
