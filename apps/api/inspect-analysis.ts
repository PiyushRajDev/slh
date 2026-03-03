import prisma from './src/db';

async function main() {
  const records = await prisma.projectAnalysis.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      repoUrl: true,
      overallScore: true,
      profileId: true,
      confidenceLevel: true,
      report: true
    }
  });

  for (const r of records) {
    const report = r.report as any;
    console.log('\n---');
    console.log(`Repo: ${r.repoUrl}`);
    console.log(`Profile: ${r.profileId} | Score: ${r.overallScore} | Confidence: ${r.confidenceLevel}`);
    console.log(`Dimensions:`, JSON.stringify(report?.details?.dimensions?.dimensions, null, 2));
    console.log(`Signals:`, JSON.stringify(report?.details?.signals, null, 2));
    console.log(`Metrics (key fields):`, JSON.stringify({
      total_loc: report?.details?.metrics?.total_loc,
      commit_count: report?.details?.metrics?.commit_count,
      test_file_count: report?.details?.metrics?.test_file_count,
      complexity_avg: report?.details?.metrics?.complexity_avg,
      has_ci: report?.details?.metrics?.ci_config_present,
      primary_language: report?.details?.metrics?.primary_language
    }, null, 2));
  }

  await prisma.$disconnect();
}

main();
