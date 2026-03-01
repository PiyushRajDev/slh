-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN', 'SUPER_ADMIN', 'RECRUITER');

-- CreateEnum
CREATE TYPE "FetchStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('LEETCODE', 'CODEFORCES', 'HACKERRANK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "collegeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "College" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "domain" TEXT,
    "location" TEXT,
    "website" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "department" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "batch" TEXT NOT NULL,
    "section" TEXT,
    "isPlaced" BOOLEAN NOT NULL DEFAULT false,
    "placementYear" INTEGER,
    "packageOffered" DOUBLE PRECISION,
    "companyName" TEXT,
    "githubUsername" TEXT,
    "githubAccessToken" TEXT,
    "githubConnectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubProfile" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "totalRepos" INTEGER NOT NULL DEFAULT 0,
    "totalCommits" INTEGER NOT NULL DEFAULT 0,
    "totalStars" INTEGER NOT NULL DEFAULT 0,
    "totalForks" INTEGER NOT NULL DEFAULT 0,
    "languagesUsed" JSONB NOT NULL,
    "frameworks" JSONB NOT NULL,
    "repositories" JSONB NOT NULL,
    "lastFetchedAt" TIMESTAMP(3),
    "fetchStatus" "FetchStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSAProfile" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "username" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "totalSolved" INTEGER NOT NULL DEFAULT 0,
    "easySolved" INTEGER NOT NULL DEFAULT 0,
    "mediumSolved" INTEGER NOT NULL DEFAULT 0,
    "hardSolved" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "lastFetchedAt" TIMESTAMP(3),
    "fetchStatus" "FetchStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DSAProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JRICalculation" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "jriScore" DOUBLE PRECISION NOT NULL,
    "githubScore" DOUBLE PRECISION NOT NULL,
    "dsaScore" DOUBLE PRECISION NOT NULL,
    "academicScore" DOUBLE PRECISION NOT NULL,
    "hackathonScore" DOUBLE PRECISION NOT NULL,
    "weights" JSONB NOT NULL,
    "rawScores" JSONB NOT NULL,
    "algorithmVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JRICalculation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_collegeId_idx" ON "User"("collegeId");

-- CreateIndex
CREATE UNIQUE INDEX "College_shortName_key" ON "College"("shortName");

-- CreateIndex
CREATE INDEX "College_shortName_idx" ON "College"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_githubUsername_key" ON "Student"("githubUsername");

-- CreateIndex
CREATE INDEX "Student_email_idx" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_collegeId_idx" ON "Student"("collegeId");

-- CreateIndex
CREATE INDEX "Student_batch_idx" ON "Student"("batch");

-- CreateIndex
CREATE INDEX "Student_department_idx" ON "Student"("department");

-- CreateIndex
CREATE UNIQUE INDEX "Student_collegeId_rollNumber_key" ON "Student"("collegeId", "rollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubProfile_studentId_key" ON "GitHubProfile"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubProfile_username_key" ON "GitHubProfile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "DSAProfile_studentId_platform_key" ON "DSAProfile"("studentId", "platform");

-- CreateIndex
CREATE INDEX "JRICalculation_studentId_idx" ON "JRICalculation"("studentId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubProfile" ADD CONSTRAINT "GitHubProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DSAProfile" ADD CONSTRAINT "DSAProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JRICalculation" ADD CONSTRAINT "JRICalculation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
