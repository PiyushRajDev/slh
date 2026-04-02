const { PrismaClient } = require("./packages/database/src/generated/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

async function main() {
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/slh_dev";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
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

    console.log(`FOUND_COUNT:${students.length}`);
    console.log(JSON.stringify(students));
  } catch (error) {
    console.error("Error fetching students:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
