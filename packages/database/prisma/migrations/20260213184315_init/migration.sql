-- CreateTable
CREATE TABLE "DSAProfile" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "rawJson" JSONB,
    "normalizedJson" JSONB,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DSAProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DSAProfile_studentId_platform_idx" ON "DSAProfile"("studentId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "DSAProfile_studentId_platform_key" ON "DSAProfile"("studentId", "platform");
