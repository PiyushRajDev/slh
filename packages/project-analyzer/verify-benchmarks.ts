import { extractRawMetrics } from './src/metrics/metrics.ts';
import { deriveSignals } from './src/signals/signals.ts';
import { evaluateProfiles } from './src/profiles/profiles.ts';
import { withClonedRepo } from './src/git/git.ts';
import { decryptToken } from '../../apps/api/src/utils/crypto.ts';
import prisma from '../../apps/api/src/db.ts';

const TEST_REPOS = [
  { name: "Backend-Heavy", url: "https://github.com/expressjs/express" },
  { name: "Frontend-Heavy", url: "https://github.com/facebook/create-react-app" },
  { name: "Full-Stack-Monorepo", url: "https://github.com/PiyushRajDev/slh" },
  { name: "Small-Assignment", url: "https://github.com/octocat/Spoon-Knife" }
];

async function runBenchmark() {
  const student = await prisma.student.findUnique({ where: { email: 'test@slh.dev' } });
  const token = decryptToken(student!.githubAccessToken!);

  for (const repo of TEST_REPOS) {
    console.log(`\n--- Testing Archetype: ${repo.name} ---`);
    try {
      await withClonedRepo(repo.url, token, async (path) => {
        const metrics = await extractRawMetrics(path, repo.url, token);
        const signals = deriveSignals(metrics);
        const profiles = evaluateProfiles(signals);

        const activeProfile = profiles.find(p => p.status === 'active');
        
        console.log(`Result: ${activeProfile ? activeProfile.displayName : "No Profile Matched"}`);
        console.log(`Fitness: ${activeProfile?.fitnessScore.toFixed(2)}`);
        console.log(`Top Matched Signals: ${activeProfile?.matchedSignals.slice(0, 3).join(', ')}`);
      });
    } catch (e) {
      console.error(`Failed to analyze ${repo.name}:`, e);
    }
  }
  await prisma.$disconnect();
}

runBenchmark();