/*
  Warnings:

  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;

-- CreateTable
CREATE TABLE "CorporateMember" (
    "id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "company" TEXT NOT NULL,

    CONSTRAINT "CorporateMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruitment" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "experienced" TEXT,
    "salary" TEXT,
    "task" TEXT,
    "position" TEXT,
    "required" TEXT,
    "preferred" TEXT,
    "deadline" TIMESTAMP(3),

    CONSTRAINT "Recruitment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Recruitment" ADD CONSTRAINT "Recruitment_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "CorporateMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
