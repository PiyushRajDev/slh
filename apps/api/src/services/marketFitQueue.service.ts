import { Job } from "bullmq";
import prisma from "../db";
import { Permission } from "../middleware/auth.middleware";
import {
    EXTRACT_USER_CAPABILITIES_JOB_NAME,
    GENERATE_MARKET_FIT_REPORT_JOB_NAME,
    marketFitFlow,
    marketFitQueue,
    PARSE_MARKET_JOBS_JOB_NAME
} from "../lib/marketFit.queue";
import { aiService } from "../../../../packages/market-fit-core/src/aiService";
import { configureMarketFitCore } from "../../../../packages/market-fit-core/src/runtime";
import { jobIntelligenceService } from "../../../../packages/market-fit-core/src/jobIntelligence.service";
import {
    ExtractUserCapabilitiesJobData,
    GenerateMarketFitReportJobData,
    MARKET_FIT_ANALYSIS_VERSION,
    ParseMarketJobsJobData
} from "../../../../packages/market-fit-core/src/jobTypes";
import { MarketFitAnalyzeInput } from "../../../../packages/market-fit-core/src/types";

configureMarketFitCore({ prisma, aiService });

async function resolveStudentOwnerUserId(studentId: string): Promise<string | null> {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { userId: true }
    });

    return student?.userId ?? null;
}

export const marketFitQueueService = {
    async queueAnalysis(studentId: string, requestedByUserId: string, input: MarketFitAnalyzeInput) {
        const clusterKey = jobIntelligenceService.buildClusterKey(input);
        const safeClusterKey = clusterKey.replace(/:/g, "-");
        const jobId = `market-fit-${studentId}-${safeClusterKey}-${Date.now()}`;

        await marketFitFlow.add({
            name: GENERATE_MARKET_FIT_REPORT_JOB_NAME,
            queueName: "market-fit",
            data: {
                studentId,
                requestedByUserId,
                input,
                analysisVersion: MARKET_FIT_ANALYSIS_VERSION
            } satisfies GenerateMarketFitReportJobData,
            opts: {
                jobId
            },
            children: [
                {
                    name: PARSE_MARKET_JOBS_JOB_NAME,
                    queueName: "market-fit",
                    data: {
                        studentId,
                        requestedByUserId,
                        input
                    } satisfies ParseMarketJobsJobData
                },
                {
                    name: EXTRACT_USER_CAPABILITIES_JOB_NAME,
                    queueName: "market-fit",
                    data: {
                        studentId,
                        forceRefresh: input.forceRefresh
                    } satisfies ExtractUserCapabilitiesJobData
                }
            ]
        });

        return { jobId };
    },

    async getJobStatus(jobId: string, requester: { userId: string; permissions: Permission[] }) {
        const job = await Job.fromId(marketFitQueue, jobId);
        if (!job) {
            return null;
        }

        if (!requester.permissions.includes(Permission.MARKET_FIT_STATUS_READ_ANY)) {
            const ownerUserId = await resolveStudentOwnerUserId(job.data?.studentId);
            if (!ownerUserId || ownerUserId !== requester.userId) {
                throw new Error("FORBIDDEN");
            }
        }

        const state = await job.getState();
        const report = await prisma.skillGapReport.findFirst({
            where: { backgroundJobId: jobId },
            orderBy: { createdAt: "desc" }
        });

        return {
            jobId,
            state,
            progress: job.progress ?? null,
            failedReason: report?.errorMessage ?? job.failedReason ?? null,
            reportId: report?.id ?? null,
            completedAt: report?.completedAt ?? null,
            returnvalue: job.returnvalue ?? null
        };
    }
};
