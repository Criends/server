/*
  Warnings:

  - Added the required column `content` to the `AdditionalPortfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `AdditionalPortfolio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdditionalPortfolio" ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
