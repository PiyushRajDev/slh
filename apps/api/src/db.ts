import { Pool } from "pg";
import { PrismaClient } from "../../../packages/database/src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

// DATABASE_URL is expected to be provided by the environment (loaded in server.ts)
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/slh_dev";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
