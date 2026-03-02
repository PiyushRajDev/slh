import prisma from './src/db';

async function main() {
  const s = await prisma.student.findFirst({ select: { id: true, email: true } });
  console.log(s);
  await prisma.$disconnect();
}

main();
