import { calculateScore } from './src/scoring/scoring';
import { detectGaming } from './src/anti-gaming/anti-gaming';
import { selectBestProfile, AnalysisCandidate } from './src/selection/selection';
import { calculateConfidence } from './src/confidence/confidence';
import { RawMetrics } from './src/metrics/metrics';

function randomMetric(): number {
    const pool = [
        Math.random() * 1000,
        Math.random() * 100000,
        -Math.random() * 50,
        NaN,
        Infinity,
        undefined as any
    ];
    return pool[Math.floor(Math.random() * pool.length)];
}

function generateFuzzMetrics(): RawMetrics {
    return {
        complexity_avg: randomMetric(),
        total_loc: randomMetric(),
        commit_count: randomMetric(),
        commit_span_days: randomMetric(),
        folder_count: randomMetric(),
        max_depth: randomMetric(),
        long_functions_count: randomMetric()
    } as unknown as RawMetrics;
}

const TIER3_GAUNTLET = [

    {
        name: "Economic Drift Attack Over 50 Iterations",
        execute: () => {
            let highFlagTriggered = false;

            for (let i = 1; i <= 50; i++) {
                const metrics: RawMetrics = {
                    total_loc: 10000 + i * 4000,
                    complexity_avg: 6 - i * 0.08,
                    commit_count: 40 + i,
                    commit_span_days: 60
                } as RawMetrics;

                const report = detectGaming(metrics, {} as any);

                if (report.flags.some(f => f.severity === 'high')) {
                    highFlagTriggered = true;
                    break;
                }
            }

            return highFlagTriggered;
        },
        failureMessage: "Gradual metric drift evaded detection."
    },

    {
        name: "Multi-Repo Farming Should Show Diminishing Trust",
        execute: () => {
            let total = 0;

            for (let i = 0; i < 10; i++) {
                const metrics: RawMetrics = {
                    total_loc: 4000,
                    complexity_avg: 4,
                    commit_count: 30,
                    commit_span_days: 30
                } as RawMetrics;

                total += calculateScore(metrics, 'backend_api').overallScore;
            }

            return total < 850; // Adjust depending on your scoring curve
        },
        failureMessage: "Distributed repo farming inflated reputation linearly."
    },

    {
        name: "Score Stability Under Minor Perturbation",
        execute: () => {
            const base: RawMetrics = {
                total_loc: 10000,
                complexity_avg: 6,
                commit_count: 80,
                commit_span_days: 90
            } as RawMetrics;

            const baseScore = calculateScore(base, 'backend_api').overallScore;

            const perturbed: RawMetrics = {
                ...base,
                total_loc: 10020
            };

            const newScore = calculateScore(perturbed, 'backend_api').overallScore;

            return Math.abs(newScore - baseScore) < 5;
        },
        failureMessage: "Score unstable under small metric changes."
    },

    {
        name: "Reliability Edge Boundary Stability",
        execute: () => {
            const candidate: AnalysisCandidate = {
                profile: { profileId: 'edge', status: 'active', fitnessScore: 1 } as any,
                score: { overallScore: 95 } as any,
                antiGaming: { flags: Array(2).fill({ severity: 'high' }) } as any
            };

            const winner = selectBestProfile([candidate]);
            return winner.profileId === 'edge';
        },
        failureMessage: "Reliability penalty misbehaves near threshold."
    },

    {
        name: "Confidence Monotonicity Across Quality Increase",
        execute: () => {
            const low = calculateConfidence(
                { total_loc: 2000, commit_count: 10 } as any,
                { fitnessScore: 0.4, reliabilityScore: 0.5, profileId: 'a' } as any
            ).overallConfidence;

            const high = calculateConfidence(
                { total_loc: 20000, commit_count: 200 } as any,
                { fitnessScore: 0.9, reliabilityScore: 0.9, profileId: 'a' } as any
            ).overallConfidence;

            return high > low;
        },
        failureMessage: "Confidence not increasing with better signals."
    },

    {
        name: "10,000-Run Monte Carlo Stability",
        execute: () => {
            for (let i = 0; i < 10000; i++) {
                const metrics = generateFuzzMetrics();

                const score = calculateScore(metrics, 'production_web_app');
                if (!Number.isFinite(score.overallScore)) return false;
                if (score.overallScore < 0 || score.overallScore > 100) return false;

                const conf = calculateConfidence(metrics, {
                    fitnessScore: Math.random(),
                    reliabilityScore: Math.random(),
                    profileId: 'backend_api'
                } as any);

                if (!Number.isFinite(conf.overallConfidence)) return false;
                if (conf.overallConfidence < 0 || conf.overallConfidence > 1) return false;
            }

            return true;
        },
        failureMessage: "Monte Carlo fuzzing broke score/confidence invariants."
    },

    {
        name: "Cross-Module Integrity: Score + Flags + Confidence Alignment",
        execute: () => {
            const metrics: RawMetrics = {
                total_loc: 25000,
                complexity_avg: 8,
                commit_count: 200,
                commit_span_days: 120
            } as RawMetrics;

            const score = calculateScore(metrics, 'backend_api');
            const gaming = detectGaming(metrics, {} as any);

            const selection = {
                fitnessScore: 0.95,
                reliabilityScore: gaming.flags.length > 0 ? 0.4 : 0.9,
                profileId: 'backend_api'
            } as any;

            const confidence = calculateConfidence(metrics, selection);

            if (gaming.flags.some(f => f.severity === 'high')) {
                return confidence.level !== 'HIGH';
            }

            return confidence.level !== 'LOW';
        },
        failureMessage: "Score, gaming detection, and confidence misaligned."
    }

];

async function runTier3Gauntlet() {
    console.log("🔥 Executing SLH Brain Tier-3 Adversarial Gauntlet...\n");
    let passed = 0;

    for (const test of TIER3_GAUNTLET) {
        try {
            const success = test.execute();

            if (success) {
                console.log(`✅ [PASS] ${test.name}`);
                passed++;
            } else {
                console.log(`❌ [FAIL] ${test.name}`);
                console.log(`   Reason: ${test.failureMessage}`);
            }

        } catch (e) {
            console.log(`💥 [CRASH] ${test.name}`);
            console.error(e);
        }
    }

    console.log(`\n📊 Tier-3 Results: ${passed}/${TIER3_GAUNTLET.length}`);

    if (passed !== TIER3_GAUNTLET.length) {
        console.log("🚨 TIER-3 FAILURE. SYSTEM ECONOMICALLY EXPLOITABLE.");
        process.exit(1);
    } else {
        console.log("🟢 SLH Brain survived Tier-3 adversarial modeling.");
    }
}

runTier3Gauntlet();