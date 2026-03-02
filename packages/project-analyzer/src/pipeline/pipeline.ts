import { withClonedRepo } from '../git/git';
import { extractRawMetrics } from '../metrics/metrics';
import { deriveSignals } from '../signals/signals';
import { evaluateProfiles, ProfileId } from '../profiles/profiles';
import { calculateScore } from '../scoring/scoring';
import { detectGaming } from '../anti-gaming/anti-gaming';
import { selectBestProfile, AnalysisCandidate } from '../selection/selection';
import { calculateConfidence } from '../confidence/confidence';
import { formatReport, AnalysisReport } from '../report/report';

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

export async function runPipeline(
    repoUrl: string,
    token?: string
): Promise<PipelineOutput> {
    try {
        let report: AnalysisReport | undefined;

        await withClonedRepo(repoUrl, token, async (localPath) => {
            try {
                const metrics = await extractRawMetrics(localPath, repoUrl, token);
                const signals = deriveSignals(metrics);
                const profiles = evaluateProfiles(signals);

                const activeProfiles = profiles.filter(p => p.status === 'active');
                const profilesToScore = activeProfiles.length > 0 ? activeProfiles : profiles;

                const candidates: AnalysisCandidate[] = await Promise.all(
                    profilesToScore.map(async (profile) => {
                        const score = calculateScore(metrics, profile.profileId);
                        const antiGaming = detectGaming(metrics, signals);
                        return { profile, score, antiGaming };
                    })
                );

                const selection = selectBestProfile(candidates);
                const confidence = calculateConfidence(metrics, selection);
                const finalScore = calculateScore(metrics, selection.profileId as ProfileId);

                const winnerCandidate = candidates.find(c => c.profile.profileId === selection.profileId);
                const winnerAntiGaming = winnerCandidate?.antiGaming ?? { flags: [], flagCount: 0 };

                report = formatReport(
                    repoUrl,
                    metrics,
                    signals,
                    selection,
                    finalScore,
                    winnerAntiGaming,
                    confidence
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
