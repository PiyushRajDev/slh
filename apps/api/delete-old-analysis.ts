import prisma from './src/db';

async function main() {
  const deleted = await prisma.projectAnalysis.deleteMany({
    where: { 
      studentId: 'cmm8aobon0001eiuplvy7atoi',
      repoUrl: 'https://github.com/PiyushRajDev/slh'
    }
  });
  console.log(`Deleted ${deleted.count} records`);
  await prisma.$disconnect();
}

main();
