-- AlterTable: make email nullable
ALTER TABLE `Member` MODIFY `email` VARCHAR(191) NULL;

-- AlterTable: add uid column (nullable first for existing data)
ALTER TABLE `Member` ADD COLUMN `uid` VARCHAR(191) NULL;

-- Backfill: set uid from email for existing rows
UPDATE `Member` SET `uid` = `email` WHERE `uid` IS NULL;

-- AlterTable: make uid NOT NULL
ALTER TABLE `Member` MODIFY `uid` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Member_uid_key` ON `Member`(`uid`);
