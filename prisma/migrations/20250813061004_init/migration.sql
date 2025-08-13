-- AlterTable
ALTER TABLE "public"."Company" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."Person" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."TimeEntry" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Company_userId_idx" ON "public"."Company"("userId");

-- CreateIndex
CREATE INDEX "Person_userId_idx" ON "public"."Person"("userId");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "public"."Project"("userId");

-- CreateIndex
CREATE INDEX "TimeEntry_userId_idx" ON "public"."TimeEntry"("userId");

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Person" ADD CONSTRAINT "Person_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimeEntry" ADD CONSTRAINT "TimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
