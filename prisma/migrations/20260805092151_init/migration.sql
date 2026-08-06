-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "StatusCetak" AS ENUM ('BELUM_CETAK', 'SUDAH_CETAK');

-- CreateEnum
CREATE TYPE "JenjangPendidikan" AS ENUM ('D3', 'D4', 'S1', 'S2', 'S3', 'PROFESI');

-- CreateEnum
CREATE TYPE "StatusTranskrip" AS ENUM ('GENERATED', 'VOID');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fakultas" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT,
    "dekan" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "fakultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_studi" (
    "id" SERIAL NOT NULL,
    "id_fakultas" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT,
    "jenjang" "JenjangPendidikan" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "program_studi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "akreditasi" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "akreditasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa" (
    "id" SERIAL NOT NULL,
    "npm" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tempat_lahir" TEXT NOT NULL,
    "tanggal_lahir" DATE NOT NULL,
    "tahun_masuk" INTEGER NOT NULL,
    "id_fakultas" INTEGER NOT NULL,
    "id_program_studi" INTEGER NOT NULL,
    "status_cetak" "StatusCetak" NOT NULL DEFAULT 'BELUM_CETAK',
    "tanggal_lulus" DATE,
    "judul_skripsi" TEXT,
    "konsentrasi" TEXT,
    "no_ijazah" TEXT,
    "no_seri" TEXT,
    "tgl_sk_dekan" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transkrip" (
    "id" SERIAL NOT NULL,
    "id_mahasiswa" INTEGER NOT NULL,
    "npm_snapshot" TEXT NOT NULL,
    "nama_snapshot" TEXT NOT NULL,
    "id_cetak_oleh" INTEGER,
    "cetak_oleh_nama_snapshot" TEXT NOT NULL,
    "no_seri" TEXT,
    "ipk" DECIMAL(3,2) NOT NULL,
    "total_sks" INTEGER NOT NULL,
    "total_bobot_nilai" DECIMAL(6,2) NOT NULL,
    "predikat" TEXT NOT NULL,
    "judul_skripsi_snapshot" TEXT,
    "biodata_snapshot" JSONB NOT NULL,
    "matakuliah_snapshot" JSONB NOT NULL,
    "status" "StatusTranskrip" NOT NULL DEFAULT 'GENERATED',
    "voided_at" TIMESTAMP(3),
    "void_reason" TEXT,
    "scraped_at" TIMESTAMP(3) NOT NULL,
    "tanggal_cetak" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transkrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER,
    "user_nama_snapshot" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" INTEGER,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- CreateIndex
CREATE INDEX "user_deleted_at_idx" ON "user"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "fakultas_nama_key" ON "fakultas"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "fakultas_kode_key" ON "fakultas"("kode");

-- CreateIndex
CREATE INDEX "fakultas_deleted_at_idx" ON "fakultas"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "program_studi_kode_key" ON "program_studi"("kode");

-- CreateIndex
CREATE INDEX "program_studi_id_fakultas_idx" ON "program_studi"("id_fakultas");

-- CreateIndex
CREATE INDEX "program_studi_deleted_at_idx" ON "program_studi"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "program_studi_id_fakultas_nama_key" ON "program_studi"("id_fakultas", "nama");

-- CreateIndex
CREATE INDEX "akreditasi_is_active_idx" ON "akreditasi"("is_active");

-- CreateIndex
CREATE INDEX "akreditasi_deleted_at_idx" ON "akreditasi"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_npm_key" ON "mahasiswa"("npm");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_no_ijazah_key" ON "mahasiswa"("no_ijazah");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_no_seri_key" ON "mahasiswa"("no_seri");

-- CreateIndex
CREATE INDEX "mahasiswa_id_fakultas_idx" ON "mahasiswa"("id_fakultas");

-- CreateIndex
CREATE INDEX "mahasiswa_id_program_studi_idx" ON "mahasiswa"("id_program_studi");

-- CreateIndex
CREATE INDEX "mahasiswa_status_cetak_idx" ON "mahasiswa"("status_cetak");

-- CreateIndex
CREATE INDEX "mahasiswa_deleted_at_idx" ON "mahasiswa"("deleted_at");

-- CreateIndex
CREATE INDEX "transkrip_id_mahasiswa_idx" ON "transkrip"("id_mahasiswa");

-- CreateIndex
CREATE INDEX "transkrip_id_cetak_oleh_idx" ON "transkrip"("id_cetak_oleh");

-- CreateIndex
CREATE INDEX "transkrip_tanggal_cetak_idx" ON "transkrip"("tanggal_cetak");

-- CreateIndex
CREATE INDEX "transkrip_status_idx" ON "transkrip"("status");

-- CreateIndex
CREATE UNIQUE INDEX "setting_key_key" ON "setting"("key");

-- CreateIndex
CREATE INDEX "activity_log_id_user_idx" ON "activity_log"("id_user");

-- CreateIndex
CREATE INDEX "activity_log_entity_type_entity_id_idx" ON "activity_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "activity_log_created_at_idx" ON "activity_log"("created_at");

-- AddForeignKey
ALTER TABLE "program_studi" ADD CONSTRAINT "program_studi_id_fakultas_fkey" FOREIGN KEY ("id_fakultas") REFERENCES "fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_id_fakultas_fkey" FOREIGN KEY ("id_fakultas") REFERENCES "fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_id_program_studi_fkey" FOREIGN KEY ("id_program_studi") REFERENCES "program_studi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transkrip" ADD CONSTRAINT "transkrip_id_mahasiswa_fkey" FOREIGN KEY ("id_mahasiswa") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transkrip" ADD CONSTRAINT "transkrip_id_cetak_oleh_fkey" FOREIGN KEY ("id_cetak_oleh") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
