import { Response } from "express";
import prisma from "../db";
import {
    AuthRequest,
    Permission,
    hasRequestPermission
} from "../middleware/auth.middleware";
import { formatMarketFitReportResponse } from "../formatters/marketFitResponse";
import { marketFitQueueService } from "../services/marketFitQueue.service";
import { marketFitReportService } from "../../../../packages/market-fit-core/src/report.service";
import { MarketFitAnalyzeInput } from "../../../../packages/market-fit-core/src/types";

function optionalString(value: unknown): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const trimmed = value.replace(/\s+/g, " ").trim();
    return trimmed || undefined;
}

function validateMarketFitAnalyzeInput(body: unknown): MarketFitAnalyzeInput {
    if (!body || typeof body !== "object") {
        throw new Error("Request body is required");
    }

    const payload = body as Record<string, unknown>;
    const role = optionalString(payload.role);
    const seniority = optionalString(payload.seniority);
    if (!role) {
        throw new Error("role is required");
    }
    if (!seniority) {
        throw new Error("seniority is required");
    }

    const jobListings = Array.isArray(payload.jobListings)
        ? payload.jobListings
            .filter((item) => item && typeof item === "object" && typeof (item as Record<string, unknown>).description === "string")
            .slice(0, 25)
            .map((item) => {
                const row = item as Record<string, unknown>;
                return {
                    source: optionalString(row.source),
                    externalId: optionalString(row.externalId),
                    sourceUrl: optionalString(row.sourceUrl),
                    companyName: optionalString(row.companyName),
                    title: optionalString(row.title),
                    location: optionalString(row.location),
                    employmentType: optionalString(row.employmentType),
                    workMode: optionalString(row.workMode),
                    description: String(row.description).replace(/\s+/g, " ").trim(),
                    postedAt: optionalString(row.postedAt)
                };
            })
        : undefined;

    return {
        role,
        seniority,
        location: optionalString(payload.location),
        employmentType: optionalString(payload.employmentType),
        workMode: optionalString(payload.workMode),
        userId: optionalString(payload.userId),
        studentId: optionalString(payload.studentId),
        sampleSize: typeof payload.sampleSize === "number" ? Math.max(1, Math.min(Math.round(payload.sampleSize), 25)) : 12,
        forceRefresh: Boolean(payload.forceRefresh),
        jobListings
    };
}

async function resolveStudentIdForRequest(req: AuthRequest, override?: { userId?: string; studentId?: string }): Promise<string> {
    const principal = req.auth?.principal;
    if (!principal) {
        throw new Error("UNAUTHORIZED");
    }

    const canAnalyzeAny = hasRequestPermission(req, Permission.MARKET_FIT_ANALYZE_ANY);

    if (override?.studentId) {
        if (!canAnalyzeAny) {
            throw new Error("FORBIDDEN");
        }

        return override.studentId;
    }

    if (override?.userId) {
        if (!canAnalyzeAny && override.userId !== principal.userId) {
            throw new Error("FORBIDDEN");
        }

        const student = await prisma.student.findUnique({
            where: { userId: override.userId },
            select: { id: true }
        });

        if (!student) {
            throw new Error("STUDENT_NOT_FOUND");
        }

        return student.id;
    }

    const ownStudent = await prisma.student.findUnique({
        where: { userId: principal.userId },
        select: { id: true }
    });

    if (!ownStudent) {
        throw new Error("STUDENT_NOT_FOUND");
    }

    return ownStudent.id;
}

async function resolveUserIdForReportRequest(req: AuthRequest, userIdParam: string): Promise<string> {
    const principal = req.auth?.principal;
    if (!principal) {
        throw new Error("UNAUTHORIZED");
    }

    const requestedUserId = userIdParam === "me" ? principal.userId : userIdParam;
    const canReadAnyReport = hasRequestPermission(req, Permission.MARKET_FIT_REPORT_READ_ANY);

    if (!canReadAnyReport && requestedUserId !== principal.userId) {
        throw new Error("FORBIDDEN");
    }

    return requestedUserId;
}

export const marketFitController = {
    async analyze(req: AuthRequest, res: Response): Promise<void> {
        try {
            const principal = req.auth?.principal;
            if (!principal) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }

            const input = validateMarketFitAnalyzeInput(req.body);
            const studentId = await resolveStudentIdForRequest(req, {
                userId: input.userId,
                studentId: input.studentId
            });

            const result = await marketFitQueueService.queueAnalysis(studentId, principal.userId, input);
            res.status(202).json({
                message: "Market fit analysis queued",
                jobId: result.jobId
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to queue market fit analysis";

            if (message === "UNAUTHORIZED") {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }

            if (message === "FORBIDDEN") {
                res.status(403).json({ error: "Forbidden" });
                return;
            }

            if (message === "STUDENT_NOT_FOUND" || message === "role is required" || message === "seniority is required" || message === "Request body is required") {
                res.status(400).json({ error: message });
                return;
            }

            res.status(500).json({ error: message });
        }
    },

    async getLatestReport(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.auth?.principal) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }

            const userIdParam = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
            if (!userIdParam) {
                res.status(400).json({ error: "userId is required" });
                return;
            }

            const requestedUserId = await resolveUserIdForReportRequest(req, userIdParam);
            const student = await prisma.student.findUnique({
                where: { userId: requestedUserId },
                select: { id: true }
            });

            if (!student) {
                res.status(404).json({ error: "Student not found" });
                return;
            }

            const report = await marketFitReportService.getLatestReportForStudent(student.id);
            if (!report || !report.reportPayload) {
                res.status(404).json({ error: "Market fit report not found" });
                return;
            }

            res.status(200).json(formatMarketFitReportResponse(report));
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch market fit report";
            const status = message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 500;
            res.status(status).json({ error: status === 500 ? "Failed to fetch market fit report" : message === "FORBIDDEN" ? "Forbidden" : "Unauthorized" });
        }
    },

    async getStatus(req: AuthRequest, res: Response): Promise<void> {
        try {
            const principal = req.auth?.principal;
            if (!principal) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }

            const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
            if (!jobId) {
                res.status(400).json({ error: "jobId is required" });
                return;
            }

            const status = await marketFitQueueService.getJobStatus(jobId, {
                userId: principal.userId,
                permissions: principal.permissions
            });

            if (!status) {
                res.status(404).json({ error: "Job not found" });
                return;
            }

            res.status(200).json(status);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch job status";
            const statusCode = message === "FORBIDDEN" ? 403 : 500;
            res.status(statusCode).json({ error: statusCode === 403 ? "Forbidden" : "Failed to fetch job status" });
        }
    }
};
