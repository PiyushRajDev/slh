import prisma from './src/db';

async function main() {
  console.log('--- Checking All Users ---');
  const users = await prisma.user.findMany({
    include: { student: true }
  });
  console.log(JSON.stringify(users, null, 2));

  console.log('\n--- Checking All Colleges ---');
  const colleges = await prisma.college.findMany();
  console.log(JSON.stringify(colleges, null, 2));

  console.log('\n--- Checking All Jobs ---');
  const jobs = await prisma.job.findMany({
    include: {
        company: true,
        college: true
    }
  });
  console.log(JSON.stringify(jobs, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
