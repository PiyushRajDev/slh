import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ select: { email: true, role: true }});
  console.log("Users in DB:");
  users.forEach(u => console.log(u.email));
}
main().catch(console.error).finally(() => prisma.$disconnect());
