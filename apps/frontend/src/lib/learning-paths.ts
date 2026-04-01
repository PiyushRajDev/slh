import type { JriProfileResponse } from "./jri";

export interface Recommendation {
  id: string;
  priority: "critical" | "high" | "medium";
  category: "dsa" | "projects" | "growth" | "contests";
  title: string;
  description: string;
  action: string;
  estimatedImpact: string;
  icon: string;
}

const TIER_THRESHOLDS = [
  { tier: "Legend", min: 90 },
  { tier: "Elite", min: 80 },
  { tier: "Pro", min: 70 },
  { tier: "Rising", min: 60 },
  { tier: "Challenger", min: 45 },
  { tier: "Rookie", min: 0 },
] as const;

export function getNextTier(currentScore: number): { tier: string; min: number; gap: number } | null {
  for (const t of TIER_THRESHOLDS) {
    if (t.min > currentScore) {
      continue;
    }

    const idx = TIER_THRESHOLDS.indexOf(t);
    if (idx === 0) return null; // Already Legend

    const next = TIER_THRESHOLDS[idx - 1];
    return {
      tier: next.tier,
      min: next.min,
      gap: next.min - currentScore,
    };
  }

  return {
    tier: "Challenger",
    min: 45,
    gap: 45 - currentScore,
  };
}

export function getTierProgress(currentScore: number): {
  currentTier: string;
  nextTier: string | null;
  progress: number;
  tierFloor: number;
  tierCeiling: number;
} {
  let currentTier = "Rookie";
  let tierFloor = 0;
  let tierCeiling = 45;

  for (let i = 0; i < TIER_THRESHOLDS.length; i++) {
    if (currentScore >= TIER_THRESHOLDS[i].min) {
      currentTier = TIER_THRESHOLDS[i].tier;
      tierFloor = TIER_THRESHOLDS[i].min;
      tierCeiling = i > 0 ? TIER_THRESHOLDS[i - 1].min : 100;
      break;
    }
  }

  const nextInfo = getNextTier(currentScore);
  const range = tierCeiling - tierFloor;
  const progress = range > 0 ? Math.min(100, ((currentScore - tierFloor) / range) * 100) : 100;

  return {
    currentTier,
    nextTier: nextInfo?.tier ?? null,
    progress,
    tierFloor,
    tierCeiling,
  };
}

export function generateRecommendations(profile: JriProfileResponse): Recommendation[] {
  const recs: Recommendation[] = [];
  const { card, platforms, projects } = profile;
  const attrs = card.attributes;
  const lc = platforms.leetcode;
  const cf = platforms.codeforces;

  // ── DSA Recommendations ──

  if (lc.fetchStatus !== "SUCCESS" && cf.fetchStatus !== "SUCCESS") {
    recs.push({
      id: "link-dsa",
      priority: "critical",
      category: "dsa",
      title: "Link your DSA profiles",
      description: "Your JRI is incomplete without DSA data. Link LeetCode or Codeforces to get a full score.",
      action: "Enter your username in the DSA tab and verify",
      estimatedImpact: "+15-30 JRI points",
      icon: "🔗",
    });
  }

  if (lc.fetchStatus === "SUCCESS" && lc.totalSolved < 50) {
    recs.push({
      id: "lc-volume",
      priority: "critical",
      category: "dsa",
      title: "Increase LeetCode problem count",
      description: `You've solved ${lc.totalSolved} problems. Aim for 100+ to signal consistent practice.`,
      action: "Solve 3-5 problems daily, focusing on Arrays and Strings first",
      estimatedImpact: "+8-12 JRI points",
      icon: "📈",
    });
  } else if (lc.fetchStatus === "SUCCESS" && lc.totalSolved < 200) {
    recs.push({
      id: "lc-intermediate",
      priority: "high",
      category: "dsa",
      title: "Reach 200+ LeetCode problems",
      description: `At ${lc.totalSolved} solved, you're building momentum. Push past 200 to stand out.`,
      action: "Focus on Medium problems in DP, Trees, and Graphs",
      estimatedImpact: "+5-8 JRI points",
      icon: "🎯",
    });
  }

  if (lc.fetchStatus === "SUCCESS" && lc.hardSolved < 10) {
    recs.push({
      id: "lc-hard",
      priority: "high",
      category: "dsa",
      title: "Tackle more Hard problems",
      description: `Only ${lc.hardSolved} Hard problems solved. Hard problems disproportionately boost your Problem Solving score.`,
      action: "Attempt 2 Hard problems per week from top interview lists",
      estimatedImpact: "+3-6 JRI points",
      icon: "💪",
    });
  }

  if (lc.fetchStatus === "SUCCESS" && lc.mediumSolved < 50) {
    recs.push({
      id: "lc-medium-depth",
      priority: "medium",
      category: "dsa",
      title: "Deepen Medium problem mastery",
      description: `${lc.mediumSolved} Medium problems solved. Mediums are the backbone of coding interviews.`,
      action: "Focus on DP, Backtracking, and Graph problems",
      estimatedImpact: "+3-5 JRI points",
      icon: "🧩",
    });
  }

  // ── Contest Recommendations ──

  const totalContests = lc.contestsCount + cf.contestsCount;
  if (totalContests === 0 && (lc.fetchStatus === "SUCCESS" || cf.fetchStatus === "SUCCESS")) {
    recs.push({
      id: "first-contest",
      priority: "high",
      category: "contests",
      title: "Participate in your first contest",
      description: "Contest participation signals competitive drive and time-pressure ability.",
      action: "Join the next weekly LeetCode or Codeforces contest",
      estimatedImpact: "+2-4 JRI points",
      icon: "🏆",
    });
  } else if (totalContests > 0 && totalContests < 10) {
    recs.push({
      id: "more-contests",
      priority: "medium",
      category: "contests",
      title: "Build contest consistency",
      description: `${totalContests} contests so far. Regular participation builds both rating and Delivery score.`,
      action: "Aim for 2-3 contests per month",
      estimatedImpact: "+2-3 JRI points",
      icon: "📊",
    });
  }

  // ── Project Recommendations ──

  if (projects.analysesCount === 0) {
    recs.push({
      id: "first-project",
      priority: "critical",
      category: "projects",
      title: "Analyze your first project",
      description: "No project data yet. Submit a GitHub repository to complete your profile.",
      action: "Go to Analyze and submit your best public repository",
      estimatedImpact: "+10-20 JRI points",
      icon: "🚀",
    });
  } else if (projects.averageScore < 30) {
    recs.push({
      id: "improve-project-quality",
      priority: "critical",
      category: "projects",
      title: "Improve project quality signals",
      description: "Your average project score suggests gaps in testing, documentation, or structure.",
      action: "Add unit tests, a proper README, and clean git commit history to your top project",
      estimatedImpact: "+8-15 JRI points",
      icon: "🔧",
    });
  } else if (projects.averageScore < 50) {
    recs.push({
      id: "level-up-projects",
      priority: "high",
      category: "projects",
      title: "Level up project architecture",
      description: "Your projects show promise. Add production-grade patterns to stand out.",
      action: "Add error handling, environment configs, CI/CD pipeline, and API documentation",
      estimatedImpact: "+5-10 JRI points",
      icon: "🏗️",
    });
  }

  if (projects.analysesCount < 3 && projects.analysesCount > 0) {
    recs.push({
      id: "more-projects",
      priority: "medium",
      category: "projects",
      title: "Analyze more repositories",
      description: "Multiple analyzed projects show breadth and consistency.",
      action: "Submit 2-3 more repositories to build your portfolio",
      estimatedImpact: "+3-6 JRI points",
      icon: "📦",
    });
  }

  if (projects.growth < 0 && projects.analysesCount >= 2) {
    recs.push({
      id: "declining-quality",
      priority: "high",
      category: "growth",
      title: "Project quality is declining",
      description: "Your latest scores are lower than earlier ones. Re-analyze after improvements.",
      action: "Revisit your latest project — add tests, fix linting, improve documentation",
      estimatedImpact: "Reverse negative trend",
      icon: "⚠️",
    });
  }

  // ── Attribute-Specific Recommendations ──

  if ((attrs["Problem Solving"] ?? 0) < 35) {
    recs.push({
      id: "weak-problem-solving",
      priority: "high",
      category: "dsa",
      title: "Strengthen Problem Solving",
      description: "Your weakest attribute. This is the #1 skill recruiters test in interviews.",
      action: "Complete the 'Blind 75' or 'NeetCode 150' lists on LeetCode",
      estimatedImpact: "Major attribute improvement",
      icon: "🧠",
    });
  }

  if ((attrs["Code Quality"] ?? 0) < 35) {
    recs.push({
      id: "weak-code-quality",
      priority: "high",
      category: "projects",
      title: "Improve Code Quality",
      description: "Low Code Quality score. This reflects testing, documentation, and clean code practices.",
      action: "Add ESLint/Prettier config, write meaningful unit tests, and document your code",
      estimatedImpact: "Major attribute improvement",
      icon: "✨",
    });
  }

  if ((attrs["Learning Velocity"] ?? 0) < 30) {
    recs.push({
      id: "weak-learning",
      priority: "medium",
      category: "growth",
      title: "Accelerate your learning",
      description: "Your Learning Velocity is low. Show growth over time with consistent practice.",
      action: "Set a weekly goal: 10 LeetCode problems + 1 commit to a project",
      estimatedImpact: "Steady attribute improvement",
      icon: "📚",
    });
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recs.slice(0, 5);
}
