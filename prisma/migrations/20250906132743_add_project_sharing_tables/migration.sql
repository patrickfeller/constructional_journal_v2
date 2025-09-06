-- CreateEnum
CREATE TYPE "public"."ProjectRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "public"."ProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."ProjectRole" NOT NULL,
    "invitedBy" TEXT,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PersonalPerson" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hourlyRate" DECIMAL(65,30),
    "defaultCompanyId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PersonalCompany" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hourlyRateDefault" DECIMAL(65,30),
    "address" TEXT,
    "contactInfo" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalCompany_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "public"."Company" DROP CONSTRAINT IF EXISTS "Company_name_key";
ALTER TABLE "public"."Company" ADD COLUMN     "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "public"."Company" ADD COLUMN     "addedBy" TEXT;
ALTER TABLE "public"."Company" ADD COLUMN     "projectId" TEXT;
ALTER TABLE "public"."Company" ADD COLUMN     "sourcePersonalCompanyId" TEXT;

-- AlterTable
ALTER TABLE "public"."Person" ADD COLUMN     "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "public"."Person" ADD COLUMN     "addedBy" TEXT;
ALTER TABLE "public"."Person" ADD COLUMN     "projectId" TEXT;
ALTER TABLE "public"."Person" ADD COLUMN     "sourcePersonalPersonId" TEXT;

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "public"."ProjectMember"("projectId");
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "public"."ProjectMember"("projectId", "userId");
CREATE INDEX "ProjectMember_userId_idx" ON "public"."ProjectMember"("userId");

-- CreateIndex
CREATE INDEX "PersonalPerson_name_idx" ON "public"."PersonalPerson"("name");
CREATE INDEX "PersonalPerson_userId_idx" ON "public"."PersonalPerson"("userId");

-- CreateIndex
CREATE INDEX "PersonalCompany_name_idx" ON "public"."PersonalCompany"("name");
CREATE INDEX "PersonalCompany_userId_idx" ON "public"."PersonalCompany"("userId");

-- CreateIndex
CREATE INDEX "Company_projectId_idx" ON "public"."Company"("projectId");

-- CreateIndex
CREATE INDEX "Person_projectId_idx" ON "public"."Person"("projectId");

-- AddForeignKey
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonalPerson" ADD CONSTRAINT "PersonalPerson_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."PersonalPerson" ADD CONSTRAINT "PersonalPerson_defaultCompanyId_fkey" FOREIGN KEY ("defaultCompanyId") REFERENCES "public"."PersonalCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonalCompany" ADD CONSTRAINT "PersonalCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Company" ADD CONSTRAINT "Company_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."Company" ADD CONSTRAINT "Company_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."Company" ADD CONSTRAINT "Company_sourcePersonalCompanyId_fkey" FOREIGN KEY ("sourcePersonalCompanyId") REFERENCES "public"."PersonalCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Person" ADD CONSTRAINT "Person_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."Person" ADD CONSTRAINT "Person_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."Person" ADD CONSTRAINT "Person_sourcePersonalPersonId_fkey" FOREIGN KEY ("sourcePersonalPersonId") REFERENCES "public"."PersonalPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
