/*
  Warnings:

  - You are about to drop the `ResumeInfo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ResumeInfo" DROP CONSTRAINT "ResumeInfo_id_fkey";

-- DropTable
DROP TABLE "ResumeInfo";

-- CreateTable
CREATE TABLE "PersonnelInfo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "profileImage" TEXT,

    CONSTRAINT "PersonnelInfo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PersonnelInfo" ADD CONSTRAINT "PersonnelInfo_id_fkey" FOREIGN KEY ("id") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
