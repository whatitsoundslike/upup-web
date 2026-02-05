-- CreateTable
CREATE TABLE `GemTransaction` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `memberId` BIGINT NOT NULL,
    `type` VARCHAR(10) NOT NULL,
    `amount` INTEGER NOT NULL,
    `source` VARCHAR(50) NOT NULL,
    `memo` VARCHAR(200) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GemTransaction_memberId_idx`(`memberId`),
    INDEX `GemTransaction_memberId_createdAt_idx`(`memberId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
