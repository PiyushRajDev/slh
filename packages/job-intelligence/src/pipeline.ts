import type { PrismaClient } from '../../database/src/generated/client';
import type { JobFilters, JobIntelligenceResult } from './types';
import { aggregateJobs } from './providers';
import { extractSkillsFromJobs } from './ai/extractSkills';
import { analyzeDemand } from './ai/analyzeDemand';
import { buildStudentProfile } from './profile/buildProfile';
import { performGapAnalysis } from './ai/gapAnalysis';
import { generateRoadmap } from './ai/roadmap';

type ProgressCallback = (percent: number, message: string, stage: string) => void;

function stageProgress(
  base: number,
  weight: number,
  completed: number,
  total: number
): number {
  return Math.round(base + (completed / Math.max(total, 1)) * weight);
}

export async function runJobIntelligencePipeline(
  prisma: PrismaClient,
  filters: JobFilters,
  studentId: string,
  reportId: string,
  onProgress: ProgressCallback
): Promise<JobIntelligenceResult> {
  // Load existing report for checkpoint recovery
  const existing = await prisma.jobIntelligenceReport.findUnique({
    where: { id: reportId },
    select: { jobs: true, skillsAnalysis: true, gapAnalysis: true, roadmap: true },
  });

  // ── Stage 1: Fetch Jobs (0 → 20%) ──────────────────────────────────
  let jobs: any[];
  if (existing?.jobs) {
    jobs = existing.jobs as any[];
    onProgress(20, 'Loaded jobs from cache', 'fetching');
  } else {
    onProgress(0, 'Fetching jobs from providers...', 'fetching');
    const rawJobs = await aggregateJobs(prisma, filters);
    onProgress(10, `Found ${rawJobs.length} jobs`, 'fetching');

    // ── Stage 2: Extract Skills (20 → 45%) ───────────────────────────
    const annotated = await extractSkillsFromJobs(prisma, rawJobs);
    for (let i = 0; i < annotated.length; i++) {
      onProgress(stageProgress(20, 25, i + 1, annotated.length), `Analyzing job ${i + 1}/${annotated.length}...`, 'extracting');
    }

    jobs = annotated;
    await prisma.jobIntelligenceReport.update({
      where: { id: reportId },
      data: { jobs: jobs as any, stage: 'extracting', progress: 45 },
    });
  }

  onProgress(45, 'Computing skill demand...', 'analyzing_demand');

  // ── Stage 3: Demand Analysis (45 → 55%) ─────────────────────────────
  let skillsAnalysis: any[];
  if (existing?.skillsAnalysis) {
    skillsAnalysis = existing.skillsAnalysis as any[];
  } else {
    skillsAnalysis = await analyzeDemand(prisma, jobs, filters.role);
    await prisma.jobIntelligenceReport.update({
      where: { id: reportId },
      data: { skillsAnalysis: skillsAnalysis as any, stage: 'analyzing_demand', progress: 55 },
    });
  }
  onProgress(55, 'Building your capability profile...', 'building_profile');

  // ── Stage 4: Build Student Profile (55 → 65%) ───────────────────────
  const profile = await buildStudentProfile(prisma, studentId);
  onProgress(65, 'Comparing your skills to market...', 'gap_analysis');

  // ── Stage 5: Gap Analysis (65 → 80%) ────────────────────────────────
  let gapAnalysis: any;
  if (existing?.gapAnalysis) {
    gapAnalysis = existing.gapAnalysis;
  } else {
    gapAnalysis = await performGapAnalysis(skillsAnalysis, profile);
    await prisma.jobIntelligenceReport.update({
      where: { id: reportId },
      data: { gapAnalysis: gapAnalysis as any, stage: 'gap_analysis', progress: 80 },
    });
  }
  onProgress(80, 'Generating your learning roadmap...', 'roadmap');

  // ── Stage 6: Roadmap (80 → 100%) ────────────────────────────────────
  let roadmap: any;
  if (existing?.roadmap) {
    roadmap = existing.roadmap;
  } else {
    roadmap = await generateRoadmap(gapAnalysis.missing, gapAnalysis.partial, filters.role);
    await prisma.jobIntelligenceReport.update({
      where: { id: reportId },
      data: { roadmap: roadmap as any, stage: 'roadmap', progress: 100 },
    });
  }
  onProgress(100, 'Analysis complete', 'complete');

  return { jobs, skillsAnalysis, gapAnalysis, roadmap };
}
