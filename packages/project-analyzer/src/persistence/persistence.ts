import { z, ZodIssue } from 'zod';
import { createHash } from 'crypto';
import { AnalysisReport } from '../report/report';

export class SchemaValidationError extends Error {
    public issues: ZodIssue[];
    constructor(issues: ZodIssue[]) {
        super('Schema Validation Failed');
        this.name = 'SchemaValidationError';
        this.issues = issues;
    }
}

export class UnsupportedSchemaVersionError extends Error {
    constructor(version: string) {
        super(`Unsupported Schema Version: ${version}`);
        this.name = 'UnsupportedSchemaVersionError';
    }
}

const AnalysisReportSchema = z.object({
    version: z.literal('1.0.0'),
    timestamp: z.string().datetime(),
    repoUrl: z.string().url(),
    summary: z.object({
        profileId: z.string(),
        displayName: z.string(),
        overallScore: z.number().int().min(0).max(100),
        confidenceLevel: z.string(),
        reliabilityLevel: z.string()
    }).strict(),
    details: z.object({
        dimensions: z.object({
            overallScore: z.number().finite()
        }).passthrough(),
        confidence: z.object({}).passthrough(),
        antiGaming: z.object({
            flagCount: z.number().int().min(0),
            flags: z.array(z.any())
        }).passthrough(),
        signals: z.object({}).passthrough(),
        metrics: z.object({
            commit_sha: z.string()
        }).passthrough()
    }).strict()
}).strict();

function canonicalStringify(obj: any): string {
    if (obj === null || obj === undefined) {
        return 'null';
    }
    if (typeof obj !== 'object') {
        return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
        const arrStr = obj.map(item => canonicalStringify(item)).join(',');
        return `[${arrStr}]`;
    }

    const keys = Object.keys(obj).sort();
    const objStr = keys.map(key => {
        const val = obj[key] === undefined ? null : obj[key];
        return `${JSON.stringify(key)}:${canonicalStringify(val)}`;
    }).join(',');

    return `{${objStr}}`;
}

function computeIntegrityHash(report: AnalysisReport): string {
    // Clone to safely remove timestamp without mutating original
    const clone = JSON.parse(JSON.stringify(report)) as AnalysisReport;
    (clone as any).timestamp = undefined;

    const canonicalString = canonicalStringify(clone);
    return createHash('sha256').update(canonicalString).digest('hex');
}

export function validateReport(report: unknown): AnalysisReport {
    const result = AnalysisReportSchema.safeParse(report);
    if (!result.success) {
        throw new SchemaValidationError(result.error.issues);
    }
    return result.data as unknown as AnalysisReport;
}

export function verifyIntegrity(report: AnalysisReport, storedHash: string): boolean {
    const computedHash = computeIntegrityHash(report);
    return computedHash === storedHash;
}

export interface PersistencePayload {
    commitSha: string;
    report: AnalysisReport;
    integrityHash: string;
    overallScore: number;
    profileId: string;
    confidenceLevel: string;
    reliabilityLevel: string;
    flagCount: number;
    analyzerVersion: string;
}

export function buildPersistencePayload(report: AnalysisReport): PersistencePayload {
    const validated = validateReport(report);

    if (validated.version !== '1.0.0') {
        throw new UnsupportedSchemaVersionError(validated.version);
    }

    const integrityHash = computeIntegrityHash(validated);

    return {
        commitSha: validated.details.metrics.commit_sha as string,
        report: validated,
        integrityHash,
        overallScore: validated.summary.overallScore,
        profileId: validated.summary.profileId,
        confidenceLevel: validated.summary.confidenceLevel,
        reliabilityLevel: validated.summary.reliabilityLevel,
        flagCount: validated.details.antiGaming.flagCount,
        analyzerVersion: validated.version
    };
}
