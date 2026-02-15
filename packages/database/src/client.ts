import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  console.log(`[PrismaClient] Initializing with DB_HOST: ${url.host}, DB_USER: ${url.username}`);
} else {
  console.error("[PrismaClient] ERROR: DATABASE_URL is undefined during initialization!");
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
