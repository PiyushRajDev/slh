ALTER TABLE "Capability"
ADD COLUMN "recommendation" TEXT,
ADD COLUMN "projectSuggestion" TEXT;

CREATE TYPE "SignalMappingSourceType" AS ENUM (
    'PROJECT_PROFILE',
    'PROJECT_SIGNAL',
    'PROJECT_DIMENSION',
    'PROJECT_TERM',
    'GITHUB_TERM',
    'DSA_PROFILE',
    'JRI_PROFILE'
);

CREATE TYPE "SignalMappingMatcherType" AS ENUM (
    'EXACT',
    'CONTAINS',
    'BOOLEAN_TRUE',
    'THRESHOLD'
);

CREATE TABLE "SignalMapping" (
    "id" TEXT NOT NULL,
    "sourceType" "SignalMappingSourceType" NOT NULL,
    "matcherType" "SignalMappingMatcherType" NOT NULL,
    "matcherKey" TEXT NOT NULL,
    "matcherValue" TEXT,
    "targetCapabilitySlug" TEXT NOT NULL,
    "baseScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreMultiplier" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "minThreshold" DOUBLE PRECISION,
    "profileIds" JSONB,
    "evidenceTemplate" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignalMapping_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketFitConfig" (
    "key" TEXT NOT NULL,
    "valueNumber" DOUBLE PRECISION,
    "valueString" TEXT,
    "valueJson" JSONB,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketFitConfig_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "SignalMapping_sourceType_matcherKey_isActive_idx" ON "SignalMapping"("sourceType", "matcherKey", "isActive");
CREATE INDEX "SignalMapping_targetCapabilitySlug_isActive_idx" ON "SignalMapping"("targetCapabilitySlug", "isActive");

ALTER TABLE "SignalMapping"
ADD CONSTRAINT "SignalMapping_targetCapabilitySlug_fkey"
FOREIGN KEY ("targetCapabilitySlug") REFERENCES "Capability"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
