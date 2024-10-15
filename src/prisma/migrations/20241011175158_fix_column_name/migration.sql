/*
  Warnings:

  - You are about to drop the column `projectIndex` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "projectIndex",
ADD COLUMN     "projectSiteIndex" INTEGER NOT NULL DEFAULT 2;
