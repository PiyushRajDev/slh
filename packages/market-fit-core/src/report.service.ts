import { getMarketFitCoreRuntime } from "./runtime";
import { CapabilityGapItem, MarketFitReportPayload } from "./types";

type PersistedCapabilityRow = CapabilityGapItem & {
    matchStatus: "MATCHED" | "PARTIAL" | "MISSING";
};

export const marketFitReportService = {
    async createPendingReport(input: {
        studentId: string;
        clusterId: string;
        userCapabilityProfileId: string;
        requestedByUserId: string;
        backgroundJobId: string;
        roleSlug: string;
        roleTitle: string;
        seniority?: string;
        location?: string;
    }) {
        const { prisma } = getMarketFitCoreRuntime();
        return prisma.skillGapReport.create({
            data: {
                studentId: input.studentId,
                clusterId: input.clusterId,
                userCapabilityProfileId: input.userCapabilityProfileId,
                requestedByUserId: input.requestedByUserId,
                backgroundJobId: input.backgroundJobId,
                roleSlug: input.roleSlug,
                roleTitle: input.roleTitle,
                seniority: input.seniority,
                location: input.location,
                status: "PENDING"
            }
        });
    },

    async markProcessing(reportId: string): Promise<void> {
        const { prisma } = getMarketFitCoreRuntime();
        await prisma.skillGapReport.update({
            where: { id: reportId },
            data: {
                status: "IN_PROGRESS",
                startedAt: new Date(),
                errorMessage: null
            }
        });
    },

    async completeReport(input: {
        reportId: string;
        payload: MarketFitReportPayload;
        capabilityRows: PersistedCapabilityRow[];
        jobCount: number;
    }) {
        const { prisma } = getMarketFitCoreRuntime();
        await prisma.$transaction(async (tx) => {
            await tx.skillGapReportCapability.deleteMany({
                where: { reportId: input.reportId }
            });

            const report = await tx.skillGapReport.update({
                where: { id: input.reportId },
                data: {
                    status: "COMPLETED",
                    readinessScore: input.payload.readinessScore,
                    verdict: input.payload.verdict,
                    actionPlan: input.payload.actionPlan as any,
                    reportPayload: input.payload as any,
                    summary: {
                        baselineRole: input.payload.baselineRole,
                        baselineSeniority: input.payload.baselineSeniority,
                        dataFreshness: input.payload.dataFreshness,
                        generatedAt: input.payload.generatedAt,
                        sampleSize: input.payload.sampleSize,
                        matchedCount: input.payload.matchedCapabilities.length,
                        missingCount: input.payload.missingCapabilities.length,
                        partialCount: input.payload.partialCapabilities.length
                    } as any,
                    jobCount: input.jobCount,
                    completedAt: new Date()
                }
            });

            if (input.capabilityRows.length > 0) {
                await tx.skillGapReportCapability.createMany({
                    data: input.capabilityRows.map((row) => ({
                        reportId: report.id,
                        capabilityId: row.capabilityId,
                        matchStatus: row.matchStatus,
                        demandScore: row.demandScore,
                        userScore: row.userScore,
                        gapScore: row.gapScore,
                        evidence: row.evidence as any
                    }))
                });
            }
        });
    },

    async failReport(reportId: string, errorMessage: string): Promise<void> {
        const { prisma } = getMarketFitCoreRuntime();
        await prisma.skillGapReport.update({
            where: { id: reportId },
            data: {
                status: "FAILED",
                errorMessage,
                completedAt: new Date()
            }
        });
    },

    async getLatestReportForStudent(studentId: string) {
        const { prisma } = getMarketFitCoreRuntime();
        return prisma.skillGapReport.findFirst({
            where: {
                studentId,
                status: "COMPLETED"
            },
            orderBy: { createdAt: "desc" }
        });
    },

    async getReportByBackgroundJob(jobId: string) {
        const { prisma } = getMarketFitCoreRuntime();
        return prisma.skillGapReport.findFirst({
            where: { backgroundJobId: jobId },
            orderBy: { createdAt: "desc" }
        });
    }
};
