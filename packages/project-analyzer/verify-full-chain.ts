import { extractRawMetrics } from './src/metrics/metrics';
import { deriveSignals } from './src/signals/signals';
import { evaluateProfiles } from './src/profiles/profiles';
import { calculateScore } from './src/scoring/scoring';
import { withClonedRepo } from './src/git/git';
import { decryptToken } from '../../apps/api/src/utils/crypto.ts';
import prisma from '../../apps/api/src/db.ts';

async function runFullAnalysis(repoUrl: string) {
  const student = await prisma.student.findUnique({ where: { email: 'test@slh.dev' } });
  const token = decryptToken(student!.githubAccessToken!);

  console.log(`\n🔍 Analyzing: ${repoUrl}`);
  
  await withClonedRepo(repoUrl, token, async (path) => {
    // Block 1: Extraction
    const metrics = await extractRawMetrics(path, repoUrl, token);
    
    // Block 2: Signals
    const signals = deriveSignals(metrics);
    
    // Block 3: Profiles
    const profiles = evaluateProfiles(signals);
    const activeProfile = profiles.find(p => p.status === 'active') || profiles[0];

    // Block 4: Scoring
    const report = calculateScore(metrics, activeProfile.profileId);

    console.log(`\n--- Result for ${activeProfile.displayName} ---`);
    console.log(`Overall JRI: ${report.overallScore}/100`);
    console.log(`Fitness Score: ${(activeProfile.fitnessScore * 100).toFixed(0)}%`);
    console.log(`\nDimensions:`);
    console.log(`- Code Quality:  ${report.dimensions.codeQuality.score}/25`);
    console.log(`- Architecture:  ${report.dimensions.architecture.score}/20`);
    console.log(`- Testing:       ${report.dimensions.testing.score}/25`);
    console.log(`- Git Discipline: ${report.dimensions.git.score}/20`);
    console.log(`- DevOps:        ${report.dimensions.devops.score}/10`);
  });
}

const targetRepo = process.argv[2] || "https://github.com/PiyushRajDev/slh";
runFullAnalysis(targetRepo).then(() => prisma.$disconnect());