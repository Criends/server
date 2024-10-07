/*
  Warnings:

  - Added the required column `site` to the `ProjectSite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `ProjectSite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Skill` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectSite" ADD COLUMN     "site" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "position" TEXT NOT NULL;
