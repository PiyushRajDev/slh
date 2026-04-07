import prisma from './src/db';

async function main() {
  const collegeId = 'cmngg0m1e0000o4upno0wgzy8';
  const emails = ['ashmitdushad@gmail.com', 'test@slh.dev'];

  for (const email of emails) {
    console.log(`Updating ${email}...`);
    try {
      await prisma.user.update({
        where: { email },
        data: { collegeId }
      });
      await prisma.student.update({
        where: { email },
        data: { collegeId }
      });
      console.log(`Successfully updated ${email}`);
    } catch (err) {
      console.error(`Failed to update ${email}:`, err);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
