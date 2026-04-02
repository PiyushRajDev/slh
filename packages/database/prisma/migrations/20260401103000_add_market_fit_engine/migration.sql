CREATE TYPE "CapabilitySourceType" AS ENUM ('JOB_LISTING', 'PROJECT_ANALYSIS', 'GITHUB_PROFILE', 'DSA_PROFILE', 'JRI_PROFILE');

CREATE TYPE "CapabilityMatchStatus" AS ENUM ('MATCHED', 'PARTIAL', 'MISSING');

CREATE TABLE "JobCluster" (
    "id" TEXT NOT NULL,
    "clusterKey" TEXT NOT NULL,
    "roleSlug" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "seniority" TEXT,
    "location" TEXT,
    "employmentType" TEXT,
    "workMode" TEXT,
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "marketSignals" JSONB,
    "lastIngestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobCluster_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobListing" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT,
    "sourceUrl" TEXT,
    "companyName" TEXT,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "employmentType" TEXT,
    "workMode" TEXT,
    "descriptionRaw" TEXT NOT NULL,
    "descriptionNormalized" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "normalizedHash" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobListing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Capability" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "synonyms" JSONB,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capability_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobCapabilityMap" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "jobListingId" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "demandScore" DOUBLE PRECISION NOT NULL,
    "importance" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "evidence" JSONB,
    "extractionVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobCapabilityMap_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserCapabilityProfile" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "snapshotHash" TEXT NOT NULL,
    "sourceSummary" JSONB,
    "evidenceWindowDays" INTEGER NOT NULL DEFAULT 180,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCapabilityProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserCapabilityEvidence" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "sourceType" "CapabilitySourceType" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "evidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCapabilityEvidence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SkillGapReport" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "userCapabilityProfileId" TEXT NOT NULL,
    "requestedByUserId" TEXT,
    "backgroundJobId" TEXT,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "roleSlug" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "seniority" TEXT,
    "location" TEXT,
    "readinessScore" DOUBLE PRECISION,
    "verdict" TEXT,
    "summary" JSONB,
    "reportPayload" JSONB,
    "actionPlan" JSONB,
    "jobCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillGapReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SkillGapReportCapability" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "matchStatus" "CapabilityMatchStatus" NOT NULL,
    "demandScore" DOUBLE PRECISION NOT NULL,
    "userScore" DOUBLE PRECISION NOT NULL,
    "gapScore" DOUBLE PRECISION NOT NULL,
    "evidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillGapReportCapability_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobCluster_clusterKey_key" ON "JobCluster"("clusterKey");
CREATE UNIQUE INDEX "JobListing_sourceHash_key" ON "JobListing"("sourceHash");
CREATE UNIQUE INDEX "Capability_slug_key" ON "Capability"("slug");
CREATE UNIQUE INDEX "JobCapabilityMap_jobListingId_capabilityId_key" ON "JobCapabilityMap"("jobListingId", "capabilityId");
CREATE UNIQUE INDEX "UserCapabilityEvidence_profileId_capabilityId_sourceType_key" ON "UserCapabilityEvidence"("profileId", "capabilityId", "sourceType");
CREATE UNIQUE INDEX "SkillGapReport_backgroundJobId_key" ON "SkillGapReport"("backgroundJobId");
CREATE UNIQUE INDEX "SkillGapReportCapability_reportId_capabilityId_key" ON "SkillGapReportCapability"("reportId", "capabilityId");

CREATE INDEX "JobCluster_roleSlug_seniority_idx" ON "JobCluster"("roleSlug", "seniority");
CREATE INDEX "JobCluster_updatedAt_idx" ON "JobCluster"("updatedAt");
CREATE INDEX "JobListing_clusterId_normalizedHash_idx" ON "JobListing"("clusterId", "normalizedHash");
CREATE INDEX "JobListing_clusterId_title_idx" ON "JobListing"("clusterId", "title");
CREATE INDEX "JobListing_clusterId_postedAt_idx" ON "JobListing"("clusterId", "postedAt");
CREATE INDEX "Capability_category_name_idx" ON "Capability"("category", "name");
CREATE INDEX "JobCapabilityMap_clusterId_capabilityId_idx" ON "JobCapabilityMap"("clusterId", "capabilityId");
CREATE INDEX "UserCapabilityProfile_studentId_createdAt_idx" ON "UserCapabilityProfile"("studentId", "createdAt");
CREATE INDEX "UserCapabilityProfile_studentId_snapshotHash_idx" ON "UserCapabilityProfile"("studentId", "snapshotHash");
CREATE INDEX "UserCapabilityEvidence_profileId_capabilityId_idx" ON "UserCapabilityEvidence"("profileId", "capabilityId");
CREATE INDEX "SkillGapReport_studentId_createdAt_idx" ON "SkillGapReport"("studentId", "createdAt");
CREATE INDEX "SkillGapReport_clusterId_createdAt_idx" ON "SkillGapReport"("clusterId", "createdAt");
CREATE INDEX "SkillGapReport_status_createdAt_idx" ON "SkillGapReport"("status", "createdAt");
CREATE INDEX "SkillGapReportCapability_reportId_matchStatus_idx" ON "SkillGapReportCapability"("reportId", "matchStatus");
CREATE INDEX "SkillGapReportCapability_capabilityId_matchStatus_idx" ON "SkillGapReportCapability"("capabilityId", "matchStatus");

ALTER TABLE "Capability" ADD CONSTRAINT "Capability_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Capability"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobListing" ADD CONSTRAINT "JobListing_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "JobCluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JobCapabilityMap" ADD CONSTRAINT "JobCapabilityMap_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "JobCluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JobCapabilityMap" ADD CONSTRAINT "JobCapabilityMap_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JobCapabilityMap" ADD CONSTRAINT "JobCapabilityMap_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserCapabilityProfile" ADD CONSTRAINT "UserCapabilityProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserCapabilityEvidence" ADD CONSTRAINT "UserCapabilityEvidence_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserCapabilityProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserCapabilityEvidence" ADD CONSTRAINT "UserCapabilityEvidence_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SkillGapReport" ADD CONSTRAINT "SkillGapReport_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SkillGapReport" ADD CONSTRAINT "SkillGapReport_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "JobCluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SkillGapReport" ADD CONSTRAINT "SkillGapReport_userCapabilityProfileId_fkey" FOREIGN KEY ("userCapabilityProfileId") REFERENCES "UserCapabilityProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SkillGapReportCapability" ADD CONSTRAINT "SkillGapReportCapability_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "SkillGapReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SkillGapReportCapability" ADD CONSTRAINT "SkillGapReportCapability_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
