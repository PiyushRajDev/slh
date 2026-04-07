import type { PrismaClient } from '../../../database/src/generated/client';
import type { StudentCapabilityProfile } from '../types';
import { canonicalize } from '../ai/canonicalize';

export async function buildStudentProfile(
  prisma: PrismaClient,
  studentId: string
): Promise<StudentCapabilityProfile> {
  const [student, dsaProfiles, jriCalcs, projectAnalyses] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      include: { githubProfile: true },
    }),
    prisma.dSAProfile.findMany({ where: { studentId } }),
    prisma.jRICalculation.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 1,
    }),
    prisma.projectAnalysis.findMany({
      where: { studentId, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  const skillMap = new Map<string, {
    level: number;
    projects: number;
    repos: number;
    lastUsed: Date | null;
    sources: Set<string>;
  }>();

  function upsertSkill(
    name: string,
    level: number,
    source: string,
    projects = 0,
    repos = 0,
    lastUsed: Date | null = null
  ) {
    const canonical = canonicalize(name);
    const existing = skillMap.get(canonical);
    if (existing) {
      existing.level = Math.max(existing.level, level);
      existing.projects += projects;
      existing.repos += repos;
      existing.sources.add(source);
      if (lastUsed && (!existing.lastUsed || lastUsed > existing.lastUsed)) {
        existing.lastUsed = lastUsed;
      }
    } else {
      skillMap.set(canonical, { level, projects, repos, lastUsed, sources: new Set([source]) });
    }
  }

  // Extract from GitHub profile
  if (student?.githubProfile) {
    const gh = student.githubProfile;
    const langs = gh.languagesUsed as Record<string, number> | null;
    if (langs) {
      const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
      for (const [lang, bytes] of Object.entries(langs)) {
        const pct = bytes / total;
        const level = pct > 0.3 ? 3 : pct > 0.1 ? 2 : 1;
        upsertSkill(lang, level, 'github', 0, gh.totalRepos);
      }
    }
    const frameworks = gh.frameworks as string[] | null;
    if (frameworks) {
      for (const fw of frameworks) {
        upsertSkill(fw, 2, 'github', 0, gh.totalRepos);
      }
    }
  }

  // Extract from ProjectAnalysis reports
  for (const pa of projectAnalyses) {
    if (!pa.report) continue;
    const report = pa.report as any;

    // Signals from project analysis
    const signals = report?.details?.signals ?? {};
    const techStack: string[] = [];

    if (signals.hasBackend) {
      const langs: string[] = report?.details?.languages ?? [];
      for (const l of langs) {
        techStack.push(l);
        upsertSkill(l, 2, 'project-analysis', 1, 0, pa.createdAt);
      }
    }
    if (signals.hasFrontend) techStack.push('React', 'HTML', 'CSS');
    if (signals.hasDatabase) techStack.push('SQL');
    if (signals.hasCICD) techStack.push('CI/CD');

    // Profile ID gives context (e.g. "backend_api" → Node.js likely)
    if (pa.profileId === 'backend_api') {
      upsertSkill('REST APIs', 2, 'project-analysis', 1, 0, pa.createdAt);
    }
    if (pa.profileId === 'web_app') {
      upsertSkill('HTML', 2, 'project-analysis', 1, 0, pa.createdAt);
    }

    for (const skill of techStack) {
      upsertSkill(skill, 2, 'project-analysis', 1, 0, pa.createdAt);
    }
  }

  // DSA level
  const lcProfile = dsaProfiles.find(d => d.platform === 'LEETCODE');
  let dsaLevel: StudentCapabilityProfile['dsaLevel'] = 'none';
  if (lcProfile) {
    const solved = lcProfile.totalSolved;
    if (solved >= 200) dsaLevel = 'advanced';
    else if (solved >= 80) dsaLevel = 'intermediate';
    else if (solved >= 20) dsaLevel = 'beginner';
  }

  const overallJri = jriCalcs[0]?.jriScore ?? null;

  return {
    skills: [...skillMap.entries()].map(([name, data]) => ({
      name,
      level: data.level,
      evidence: {
        projects: data.projects,
        repos: data.repos,
        lastUsed: data.lastUsed?.toISOString() ?? null,
        source: [...data.sources],
      },
    })),
    dsaLevel,
    overallJri,
  };
}
