-- AlterTable: add premiumUntil for one-time premium packs (6-month pack)
ALTER TABLE "User" ADD COLUMN "premiumUntil" TIMESTAMP(3);
