import { withClonedRepo } from '../git/git';
import { extractRawMetrics } from '../metrics/metrics';
import { deriveSignals } from '../signals/signals';
import { evaluateProfiles, ProfileId } from '../profiles/profiles';
import { calculateScore } from '../scoring/scoring';
import { detectGaming } from '../anti-gaming/anti-gaming';
import { selectBestProfile, AnalysisCandidate } from '../selection/selection';
import { calculateConfidence } from '../confidence/confidence';
import { formatReport, AnalysisReport } from '../report/report';
import { scanImports } from '../authenticity/import-scanner';
import { analyzeAuthenticity } from '../authenticity/authenticity';
import fg from 'fast-glob';
import { computeCapabilityVector } from '../profiles/profiles';
import { normalizeMetrics } from '../metrics/metrics-normalization';
import { detectGamingV4 } from '../anti-gaming/anti-gaming-v4';
import { calculateScoreV4 } from '../scoring/scoring-v4';

export interface PipelineResult {
    success: true;
    report: AnalysisReport;
}

export interface PipelineError {
    success: false;
    error: string;
    stage: string;
}

export type PipelineOutput = PipelineResult | PipelineError;
export type ProgressStage = 'CLONING' | 'METRICS_EXTRACTING' | 'SIGNALS_DERIVING' | 'PROFILES_EVALUATING' | 'SCORING' | 'ANTI_GAMING' | 'SELECTING_PROFILE' | 'GENERATING_REPORT';
export type OnProgress = (stage: ProgressStage, detail?: Record<string, unknown>) => void | Promise<void>;

const PROGRESS_FILE_IGNORE = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/__pycache__/**',
    '**/venv/**',
    '**/.venv/**',
    '**/target/**',
    '**/bin/**',
    '**/obj/**'
];

async function emitProgress(
    onProgress: OnProgress | undefined,
    stage: ProgressStage,
    detail?: Record<string, unknown>
): Promise<void> {
    await onProgress?.(stage, detail);
}

async function countRepositoryFiles(localPath: string): Promise<number | undefined> {
    try {
        const files = await fg('**/*', {
            cwd: localPath,
            ignore: PROGRESS_FILE_IGNORE,
            dot: true,
            onlyFiles: true
        });

        return files.length;
    } catch {
        return undefined;
    }
}

function getTopLanguage(languages: Record<string, number>, primaryLanguage: string | null): string | null {
    if (primaryLanguage) {
        return primaryLanguage;
    }

    const [topLanguage] = Object.entries(languages).sort((a, b) => b[1] - a[1])[0] ?? [];
    return topLanguage ?? null;
}

export async function runPipeline(
    repoUrl: string,
    token?: string,
    onProgress?: OnProgress
): Promise<PipelineOutput> {
    try {
        let report: AnalysisReport | undefined;

        await emitProgress(onProgress, 'CLONING');

        await withClonedRepo(repoUrl, token, async (localPath) => {
            try {
                const fileCount = await countRepositoryFiles(localPath);
                await emitProgress(
                    onProgress,
                    'METRICS_EXTRACTING',
                    fileCount == null ? undefined : { fileCount }
                );

                const metrics = await extractRawMetrics(localPath, repoUrl, token);

                await emitProgress(onProgress, 'SIGNALS_DERIVING', {
                    topLanguage: getTopLanguage(metrics.languages, metrics.primary_language),
                    totalLoc: metrics.total_loc
                });

                // Phase 1: Authenticity Analysis
                const importedPackages = await scanImports(localPath, metrics.files);
                const authenticity = await analyzeAuthenticity(localPath, metrics, importedPackages);

                const signals = deriveSignals(metrics);
                await emitProgress(onProgress, 'PROFILES_EVALUATING', {
                    repoCount: metrics.file_count
                });

                const profiles = evaluateProfiles(signals, metrics);

                const activeProfiles = profiles.filter(p => p.status === 'active');
                const profilesToScore = activeProfiles.length > 0 ? activeProfiles : profiles;

                await emitProgress(onProgress, 'SCORING', {
                    activeProfiles: activeProfiles.length
                });

                // --- V4 ENGINE ARCHITECTURE (with V5 additions) ---
                const capabilityVector = computeCapabilityVector(profiles, metrics, metrics.confidence_scores, authenticity);
                const normalizedMetrics = normalizeMetrics(metrics, capabilityVector);

                await emitProgress(onProgress, 'ANTI_GAMING');
                const { report: winnerAntiGaming, consistencyPenalty } = detectGamingV4(normalizedMetrics, signals, capabilityVector);

                const finalScoreV4 = calculateScoreV4(normalizedMetrics, capabilityVector, consistencyPenalty, authenticity);

                // Map V4 universal score to legacy candidates for UI primary profile selection
                const scoredCandidates = profilesToScore.map((profile) => ({
                    profile,
                    score: finalScoreV4 as any,
                    antiGaming: winnerAntiGaming
                }));

                const candidates: AnalysisCandidate[] = scoredCandidates;

                const selection = selectBestProfile(candidates, signals, metrics);
                await emitProgress(onProgress, 'SELECTING_PROFILE', {
                    detected: selection.profileId
                });

                const legacyConfidence = calculateConfidence(metrics, selection);
                const confidence = {
                    ...legacyConfidence,
                    level: `${finalScoreV4.confidence_status} (${finalScoreV4.evaluation_confidence.toFixed(2)})`
                };
                
                // Map back to legacy schema for UI serialization
                const finalScore = {
                    overallScore: finalScoreV4.overallScore,
                    dimensions: finalScoreV4.dimensions as any
                };

                await emitProgress(onProgress, 'GENERATING_REPORT');

                report = formatReport(
                    repoUrl,
                    metrics,
                    signals,
                    selection,
                    finalScore,
                    winnerAntiGaming,
                    confidence as any
                );
            } catch (innerError: any) {
                throw new Error(`ANALYSIS_ERROR:${innerError.message}`);
            }
        });

        if (!report) {
            throw new Error(`ANALYSIS_ERROR:Report generation failed silently.`);
        }

        return {
            success: true,
            report
        };
    } catch (error: any) {
        if (error.message?.startsWith('ANALYSIS_ERROR:')) {
            return {
                success: false,
                error: error.message.replace('ANALYSIS_ERROR:', ''),
                stage: 'analysis'
            };
        }

        return {
            success: false,
            error: error.message || 'Unknown error',
            stage: 'clone'
        };
    }
}
