import { Pool } from "pg";
import { config } from "dotenv";
config({ path: require('path').resolve(__dirname, '../../.env') }); // fallbacks for safety
config({ path: require('path').resolve(__dirname, '../../../packages/database/.env') });
import { PrismaClient } from "../../../packages/database/src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/slh_dev";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
