import { RawMetrics } from '../metrics/metrics';
import { StructuralSignals } from '../signals/signals';
import { SelectionResult } from '../selection/selection';
import { FinalScoreReport } from '../scoring/scoring';
import { AntiGamingReport } from '../anti-gaming/anti-gaming';
import { ConfidenceReport } from '../confidence/confidence';

export interface AnalysisReport {
    version: string;
    timestamp: string;
    repoUrl: string;

    summary: {
        profileId: string;
        displayName: string;
        overallScore: number;
        confidenceLevel: string;
        reliabilityLevel: string;
    };

    details: {
        dimensions: FinalScoreReport;
        confidence: ConfidenceReport;
        antiGaming: AntiGamingReport;
        selection: {
            fitnessScore: number;
            isAmbiguous: boolean;
            runnerUpProfileId: string | null;
            secondaryProfile: string | null;
            tierOverride: boolean;
            missingGitMetrics?: boolean;
            selectionNotes?: string[];
            topCandidates?: SelectionResult['topCandidates'];
        };
        signals: StructuralSignals;
        metrics: RawMetrics;
    };
}

function sanitizeForJson<T>(value: T): T {
    if (typeof value === 'function' || typeof value === 'symbol') {
        return undefined as any; // Handled by object iteration to be removed
    }

    if (typeof value === 'bigint') {
        return Number(value) as any;
    }

    if (value instanceof Date) {
        return value.toISOString() as any;
    }

    if (typeof value === 'number') {
        if (Number.isNaN(value) || !Number.isFinite(value)) {
            return 0 as any;
        }
        return value;
    }

    if (value === null || typeof value === 'string' || typeof value === 'boolean') {
        return value;
    }

    if (Array.isArray(value)) {
        const arr: any[] = [];
        for (const item of value) {
            const sanitized = sanitizeForJson(item);
            if (sanitized !== undefined) {
                arr.push(sanitized);
            } else {
                arr.push(null); // Arrays keep their length, usually stringify turns undefined to null in arrays
            }
        }
        return arr as any;
    }

    if (typeof value === 'object') {
        const obj: any = {};
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                const val = (value as any)[key];
                const sanitized = sanitizeForJson(val);
                if (sanitized !== undefined) {
                    obj[key] = sanitized;
                }
            }
        }
        return obj as any;
    }

    return undefined as any;
}

function deepFreeze<T>(obj: T): T {
    Object.freeze(obj);
    if (obj === undefined || obj === null) return obj;

    Object.getOwnPropertyNames(obj).forEach(prop => {
        const value = (obj as any)[prop];
        if (value && typeof value === "object" && !Object.isFrozen(value)) {
            deepFreeze(value);
        }
    });
    return obj;
}

export function formatReport(
    repoUrl: string,
    metrics: RawMetrics,
    signals: StructuralSignals,
    selection: SelectionResult,
    scoreReport: FinalScoreReport,
    antiGaming: AntiGamingReport,
    confidence: ConfidenceReport,
    options?: { timestamp?: string }
): AnalysisReport {

    const reportUnsanitized: AnalysisReport = {
        version: "1.0.0",
        timestamp: options?.timestamp || new Date().toISOString(),
        repoUrl,
        summary: {
            profileId: selection.profileId,
            displayName: selection.displayName,
            overallScore: Math.round(scoreReport.overallScore),
            confidenceLevel: confidence.level,
            reliabilityLevel: selection.reliabilityLevel,
        },
        details: {
            dimensions: scoreReport,
            confidence,
            antiGaming,
            selection: {
                fitnessScore: selection.fitnessScore,
                isAmbiguous: selection.isAmbiguous,
                runnerUpProfileId: selection.runnerUpProfileId,
                secondaryProfile: selection.secondaryProfile,
                tierOverride: selection.tierOverride,
                missingGitMetrics: selection.missingGitMetrics,
                selectionNotes: selection.selectionNotes,
                topCandidates: selection.topCandidates,
            },
            signals,
            metrics,
        }
    };

    const sanitizedReport = sanitizeForJson(reportUnsanitized);
    return deepFreeze(sanitizedReport) as AnalysisReport;
}
