import { Pool } from "pg";
import { PrismaClient, Role } from "../../../packages/database/src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env
dotenv.config({ path: path.join(__dirname, "../.env") });

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/slh_dev";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting super admin setup...");
    
    // 1. List existing users
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            passwordHash: true,
            role: true
        }
    });

    console.log("--- Existing Users ---");
    console.log(JSON.stringify(users, null, 2));

    // 2. Create super admin
    const email = "superadmin@slh.com";
    const password = "SuperAdminPassword123";
    const passwordHash = await bcrypt.hash(password, 10);

    const superAdmin = await prisma.user.upsert({
        where: { email },
        update: {
            role: Role.SUPER_ADMIN,
        },
        create: {
            email,
            passwordHash,
            role: Role.SUPER_ADMIN,
        }
    });

    console.log("\n--- Super Admin Created/Updated ---");
    console.log(JSON.stringify(superAdmin, null, 2));
    console.log(`\nCredentials for Super Admin:
Email: ${email}
Password: ${password}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
