/*
  Warnings:

  - You are about to drop the column `introduce` on the `Introduce` table. All the data in the column will be lost.
  - Added the required column `index` to the `AdditionalResume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `index` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `index` to the `Contribution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Introduce` table without a default value. This is not possible if the table is not empty.
  - Added the required column `index` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `index` to the `ProjectSite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `index` to the `Site` table without a default value. This is not possible if the table is not empty.
  - Added the required column `index` to the `Skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `index` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "index" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "AdditionalPortfolio" ADD COLUMN     "index" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "AdditionalResume" ADD COLUMN     "index" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Career" ADD COLUMN     "index" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "index" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "index" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Introduce" DROP COLUMN "introduce",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "index" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "index" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ProjectSite" ADD COLUMN     "index" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "index" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "index" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "index" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TroubleShooting" ADD COLUMN     "index" INTEGER NOT NULL DEFAULT 0;
