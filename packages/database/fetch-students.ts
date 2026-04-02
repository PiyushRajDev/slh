import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      take: 180,
      select: {
        firstName: true,
        lastName: true,
        email: true,
        rollNumber: true,
        department: true,
        batch: true,
        createdAt: true
      }
    });

    console.log("Found " + students.length + " students");
    console.log(JSON.stringify(students, null, 2));
  } catch (error) {
    console.error("Error fetching students:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
