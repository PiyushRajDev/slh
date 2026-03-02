import prisma from '../../apps/api/src/db';
import { verifyIntegrity } from './src/persistence/persistence';

async function main() {
  const record = await prisma.projectAnalysis.findFirst({
    where: { status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' }
  });

  if (!record) {
    console.log('No COMPLETED records found — run verify-block10-db.ts first');
    process.exit(1);
  }

  if (!record.integrityHash) {
    console.log('Error: Found record lacks an integrityHash');
    process.exit(1);
  }

  const result = verifyIntegrity(
    record.report as any,
    record.integrityHash
  );

  console.log(
    'Integrity check on DB-read report:',
    result
      ? '✅ PASS — canonicalization is correct'
      : '❌ FAIL — verifyIntegrity hashes raw DB payload without re-canonicalizing'
  );

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});