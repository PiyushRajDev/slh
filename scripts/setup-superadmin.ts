import { PrismaClient, Role } from "./packages/database/src/generated/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    // 1. List existing users
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            passwordHash: true,
            role: true
        }
    });

    console.log("Existing Users:");
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

    console.log("\nSuper Admin Created/Updated:");
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
