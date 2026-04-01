import { ProfileId } from "../profiles/profiles";
import { FinalScoreReport } from "../scoring/scoring";

export interface Insight {
    dimension: keyof FinalScoreReport["dimensions"];
    priority: "critical" | "high" | "medium" | "low";
    title: string;
    description: string;
    impact: string;
}

const PRIORITY_ORDER: Record<Insight["priority"], number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3
};

function addInsight(
    insights: Insight[],
    insight: Insight
): void {
    if (insights.some((item) => item.title === insight.title)) {
        return;
    }

    insights.push(insight);
}

export function generateInsights(
    score: FinalScoreReport,
    profileId: ProfileId
): Insight[] {
    const insights: Insight[] = [];
    const { codeQuality, architecture, testing, git, devops } = score.dimensions;

    if (testing.score < 5) {
        addInsight(insights, {
            dimension: "testing",
            priority: "critical",
            title: "Add tests",
            description: "Testing is the clearest gap in the current project and the fastest way to improve credibility.",
            impact: "+5 to +8 points"
        });
    }

    if ((testing.breakdown.ciIntegration ?? 0) === 0) {
        addInsight(insights, {
            dimension: "testing",
            priority: "high",
            title: "Set up CI",
            description: "A basic GitHub Actions workflow that runs your tests will lift confidence and remove an obvious gap.",
            impact: "+3 to +5 points"
        });
    }

    if ((git.breakdown.gitSpread ?? 0) < 4) {
        addInsight(insights, {
            dimension: "git",
            priority: "medium",
            title: "Improve git discipline",
            description: "Spread work across more days with smaller, well-named commits instead of clustered pushes.",
            impact: "+2 to +4 points"
        });
    }

    if ((architecture.breakdown.structureScore ?? 0) <= 3) {
        addInsight(insights, {
            dimension: "architecture",
            priority: "medium",
            title: "Structure your project",
            description: "Separate routes, controllers, services, and supporting modules into clearer directories.",
            impact: "+3 to +6 points"
        });
    }

    if (
        (profileId === "backend_api" || profileId === "production_web_app") &&
        (devops.breakdown.devopsDeploy ?? 0) === 0
    ) {
        addInsight(insights, {
            dimension: "devops",
            priority: "high",
            title: "Add deployment config",
            description: "A Dockerfile or platform config signals production readiness and removes the lightweight ceiling.",
            impact: "Lifts the score ceiling"
        });
    }

    if ((codeQuality.breakdown.dryness ?? 0) < 3) {
        addInsight(insights, {
            dimension: "codeQuality",
            priority: "low",
            title: "Reduce duplication",
            description: "Consolidate repeated logic into reusable functions before the codebase grows around it.",
            impact: "+1 to +3 points"
        });
    }

    if ((git.breakdown.gitAtomicity ?? 0) <= 1) {
        addInsight(insights, {
            dimension: "git",
            priority: "medium",
            title: "Make commits more atomic",
            description: "Smaller commits with one clear intention each make the repository feel more professional and easier to review.",
            impact: "+1 to +3 points"
        });
    }

    if (codeQuality.score < 12) {
        addInsight(insights, {
            dimension: "codeQuality",
            priority: "medium",
            title: "Simplify complex code paths",
            description: "Break down long functions and deeply nested logic so the strongest work is easier to trust at a glance.",
            impact: "+2 to +4 points"
        });
    }

    return insights
        .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
        .slice(0, 5);
}
