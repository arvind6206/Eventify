/*
  Warnings:

  - You are about to alter the column `price` on the `TicketType` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "TicketType" ALTER COLUMN "price" SET DATA TYPE INTEGER;
