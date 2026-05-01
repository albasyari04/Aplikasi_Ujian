-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('SISWA', 'GURU', 'ADMIN') NOT NULL DEFAULT 'SISWA',
    `nis` VARCHAR(191) NULL,
    `kelas` VARCHAR(191) NULL,
    `fotoProfil` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ujian` (
    `id` VARCHAR(191) NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `mapel` VARCHAR(191) NOT NULL,
    `guru` VARCHAR(191) NOT NULL,
    `kelas` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'AKTIF', 'SELESAI') NOT NULL DEFAULT 'DRAFT',
    `tanggal` DATETIME(3) NOT NULL,
    `waktuMulai` DATETIME(3) NOT NULL,
    `waktuSelesai` DATETIME(3) NOT NULL,
    `durasi` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Soal` (
    `id` VARCHAR(191) NOT NULL,
    `ujianId` VARCHAR(191) NOT NULL,
    `nomor` INTEGER NOT NULL,
    `pertanyaan` TEXT NOT NULL,
    `tipe` ENUM('PILIHAN_GANDA', 'ESSAY') NOT NULL DEFAULT 'PILIHAN_GANDA',
    `opsiA` VARCHAR(191) NULL,
    `opsiB` VARCHAR(191) NULL,
    `opsiC` VARCHAR(191) NULL,
    `opsiD` VARCHAR(191) NULL,
    `opsiE` VARCHAR(191) NULL,
    `kunciJawaban` VARCHAR(191) NULL,
    `bobot` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Jawaban` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `soalId` VARCHAR(191) NOT NULL,
    `jawaban` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Jawaban_userId_soalId_key`(`userId`, `soalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HasilUjian` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `ujianId` VARCHAR(191) NOT NULL,
    `nilai` DOUBLE NOT NULL,
    `lulus` BOOLEAN NOT NULL,
    `selesaiAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Soal` ADD CONSTRAINT `Soal_ujianId_fkey` FOREIGN KEY (`ujianId`) REFERENCES `Ujian`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Jawaban` ADD CONSTRAINT `Jawaban_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Jawaban` ADD CONSTRAINT `Jawaban_soalId_fkey` FOREIGN KEY (`soalId`) REFERENCES `Soal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HasilUjian` ADD CONSTRAINT `HasilUjian_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HasilUjian` ADD CONSTRAINT `HasilUjian_ujianId_fkey` FOREIGN KEY (`ujianId`) REFERENCES `Ujian`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
