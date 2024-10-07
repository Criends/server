/*
  Warnings:

  - You are about to drop the `ProjectInfo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProjectInfo" DROP CONSTRAINT "ProjectInfo_projectInfoId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "endDate" TEXT,
ADD COLUMN     "repImages" TEXT,
ADD COLUMN     "startDate" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- DropTable
DROP TABLE "ProjectInfo";
