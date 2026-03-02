-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FETCH_GITHUB', 'FETCH_DSA', 'CALCULATE_JRI', 'ANALYZE_PROJECT');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "ProjectAnalysis" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "commitSha" TEXT NOT NULL,
    "report" JSONB NOT NULL,
    "integrityHash" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "profileId" TEXT NOT NULL,
    "confidenceLevel" TEXT NOT NULL,
    "reliabilityLevel" TEXT NOT NULL,
    "flagCount" INTEGER NOT NULL,
    "analyzerVersion" TEXT NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'COMPLETED',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectAnalysis_studentId_idx" ON "ProjectAnalysis"("studentId");

-- CreateIndex
CREATE INDEX "ProjectAnalysis_repoUrl_idx" ON "ProjectAnalysis"("repoUrl");

-- CreateIndex
CREATE INDEX "ProjectAnalysis_commitSha_idx" ON "ProjectAnalysis"("commitSha");

-- CreateIndex
CREATE INDEX "ProjectAnalysis_overallScore_idx" ON "ProjectAnalysis"("overallScore");

-- CreateIndex
CREATE INDEX "ProjectAnalysis_analyzerVersion_idx" ON "ProjectAnalysis"("analyzerVersion");

-- CreateIndex
CREATE INDEX "ProjectAnalysis_studentId_createdAt_idx" ON "ProjectAnalysis"("studentId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProjectAnalysis" ADD CONSTRAINT "ProjectAnalysis_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
