
import { extractRawMetrics } from './src/metrics/metrics';
import { deriveSignals } from './src/signals/signals';
import { decryptToken } from '../../apps/api/src/utils/crypto.ts';
import prisma from '../../apps/api/src/db.ts';
import { withClonedRepo } from './src/git/git';

async function verifyPipeline() {
  console.log("🚀 Starting End-to-End Handoff Verification...");

  // 1. Simulate DB lookup (Login Context)
  const student = await prisma.student.findUnique({
    where: { email: 'test@slh.dev' },
    select: { githubAccessToken: true, githubUsername: true }
  });

  if (!student?.githubAccessToken) throw new Error("No token found. Did you complete Block 0.3?");
  const token = decryptToken(student.githubAccessToken);
  const repoUrl = `https://github.com/${student.githubUsername}/slh`;

  // 2. Chain Block 0.5 -> Block 1 -> Block 2
  await withClonedRepo(repoUrl, token, async (localPath) => {
    console.log("📦 Block 0.5: Repo cloned successfully.");

    const metrics = await extractRawMetrics(localPath, repoUrl, token);
    console.log("📊 Block 1: Metrics extracted. LOC:", metrics.total_loc);

    const signals = deriveSignals(metrics);
    console.log("🚨 Block 2: Signals derived.");
    
    // Validate a core handoff point
    if (signals.has_backend && metrics.languages['.ts'] > 0) {
      console.log("✅ Handoff Success: Signals accurately reflect Raw Metrics.");
    } else {
      console.log("⚠️ Handoff Warning: Signals and Metrics are mismatched.");
    }

    console.log("\nFinal Signal Payload for Block 3:");
    console.log(JSON.stringify(signals, null, 2));
  });

  await prisma.$disconnect();
}

verifyPipeline().catch(console.error);
