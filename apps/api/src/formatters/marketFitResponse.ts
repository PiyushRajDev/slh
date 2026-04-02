type PersistedReport = {
    id: string;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
    roleSlug: string;
    roleTitle: string;
    seniority: string | null;
    location: string | null;
    reportPayload: unknown;
};

export function formatMarketFitReportResponse(report: PersistedReport) {
    return {
        reportId: report.id,
        status: report.status,
        createdAt: report.createdAt,
        completedAt: report.completedAt,
        roleSlug: report.roleSlug,
        roleTitle: report.roleTitle,
        seniority: report.seniority,
        location: report.location,
        ...(report.reportPayload as Record<string, unknown>)
    };
}
