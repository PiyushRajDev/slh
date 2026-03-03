import prisma from './src/db';
import bcrypt from 'bcrypt';

async function main() {
  const hash = await bcrypt.hash('Test1234!', 10);
  await prisma.user.update({
    where: { email: 'test@slh.dev' },
    data: { passwordHash: hash }
  });
  console.log('Password reset to: Test1234!');
  await prisma.$disconnect();
}

main();
