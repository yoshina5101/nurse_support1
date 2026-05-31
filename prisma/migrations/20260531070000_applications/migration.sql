-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('INTERESTED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'DECLINED');

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT '',
    "status" "ApplicationStatus" NOT NULL DEFAULT 'INTERESTED',
    "memo" TEXT NOT NULL DEFAULT '',
    "visitDate" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "examDate" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationTask" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Application_userId_status_idx" ON "Application"("userId", "status");

-- CreateIndex
CREATE INDEX "ApplicationTask_applicationId_idx" ON "ApplicationTask"("applicationId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationTask" ADD CONSTRAINT "ApplicationTask_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
