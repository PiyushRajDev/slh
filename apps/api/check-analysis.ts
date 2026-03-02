import prisma from './src/db';

async function main() {
  const records = await prisma.projectAnalysis.findMany({
    where: { studentId: 'cmm8aobon0001eiuplvy7atoi' },
    select: {
      id: true,
      status: true,
      overallScore: true,
      profileId: true,
      integrityHash: true,
      errorMessage: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Found ${records.length} records:`);
  records.forEach(r => {
    console.log(`  [${r.status}] score=${r.overallScore} profile=${r.profileId} hash=${r.integrityHash?.slice(0,16)}... error=${r.errorMessage ?? 'none'}`);
  });

  await prisma.$disconnect();
}

main();
