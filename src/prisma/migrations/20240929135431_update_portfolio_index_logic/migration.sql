/*
  Warnings:

  - The primary key for the `AdditionalResume` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Contribution` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ProjectSite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Skill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Team` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TroubleShooting` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "AdditionalResume" DROP CONSTRAINT "AdditionalResume_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "AdditionalResume_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AdditionalResume_id_seq";

-- AlterTable
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Contribution_id_seq";

-- AlterTable
ALTER TABLE "ProjectSite" DROP CONSTRAINT "ProjectSite_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ProjectSite_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ProjectSite_id_seq";

-- AlterTable
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Skill_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Skill_id_seq";

-- AlterTable
ALTER TABLE "Team" DROP CONSTRAINT "Team_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Team_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Team_id_seq";

-- AlterTable
ALTER TABLE "TroubleShooting" DROP CONSTRAINT "TroubleShooting_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "TroubleShooting_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TroubleShooting_id_seq";
