import { extractRawMetrics } from './src/metrics/metrics';
import { deriveSignals } from './src/signals/signals';
import { evaluateProfiles } from './src/profiles/profiles';
import { withClonedRepo } from './src/git/git';
import { decryptToken } from '../../apps/api/src/utils/crypto.ts';
import prisma from '../../apps/api/src/db.ts';

const ARCHETYPES = [
  { name: "Monorepo / Full-Stack", url: "https://github.com/PiyushRajDev/slh" },
  { name: "Pure Frontend", url: "https://github.com/facebook/create-react-app" },
  { name: "Pure Backend API", url: "https://github.com/expressjs/express" },
  { name: "Small Script (Noise)", url: "https://github.com/octocat/Spoon-Knife" }
];

async function runBenchmarks() {
  console.log(" Starting Cross-Archetype Intelligence Benchmark...\n");

  const student = await prisma.student.findUnique({ where: { email: 'test@slh.dev' } });
  const token = decryptToken(student!.githubAccessToken!);

  for (const repo of ARCHETYPES) {
    console.log(`\n--- Testing: ${repo.name} ---`);
    try {
      await withClonedRepo(repo.url, token, async (path) => {
        const metrics = await extractRawMetrics(path, repo.url, token);
        const signals = deriveSignals(metrics);
        const profiles = evaluateProfiles(signals);

        // Find the "Winner" (Highest active score)
        const winner = profiles.find(p => p.status === 'active');

        if (winner) {
          console.log(`✅ Classified As: ${winner.displayName}`);
          console.log(`🎯 Fitness Score: ${(winner.fitnessScore * 100).toFixed(1)}%`);
          console.log(`🟢 Matched: ${winner.matchedSignals.join(', ')}`);
          console.log(`🔴 Missing: ${winner.missingSignals.join(', ')}`);
        } else {
          console.log(`❌ Result: NO PROFILE MATCHED (Fitness below 50%)`);
          console.log(`ℹ️ Highest Potential: ${profiles[0].displayName} (${(profiles[0].fitnessScore * 100).toFixed(1)}%)`);
        }
      });
    } catch (e) {
      console.error(`Error analyzing ${repo.name}:`, e);
    }
  }
  await prisma.$disconnect();
}

runBenchmarks();