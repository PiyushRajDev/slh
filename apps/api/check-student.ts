import prisma from './src/db';

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@slh.dev' },
    include: { student: true }
  });
  console.log(JSON.stringify(user, null, 2));
  await prisma.$disconnect();
}

main();
