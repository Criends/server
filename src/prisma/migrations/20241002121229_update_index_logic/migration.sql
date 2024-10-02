/*
  Warnings:

  - You are about to drop the column `oneLine` on the `Introduce` table. All the data in the column will be lost.
  - Added the required column `title` to the `Introduce` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "index" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AdditionalPortfolio" ALTER COLUMN "index" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Career" ALTER COLUMN "index" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Introduce" DROP COLUMN "oneLine",
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "index" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TroubleShooting" ALTER COLUMN "index" DROP DEFAULT;
