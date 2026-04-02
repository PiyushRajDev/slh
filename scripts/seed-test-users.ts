import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
    PrismaClient,
    Role,
    type User,
    type Student,
    type College
} from "../packages/database/src/generated/client";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), "apps/api/.env") });

const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/slh_dev";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type SeedUser = {
    email: string;
    password: string;
    role: Role;
    collegeShortName?: string;
    student?: {
        firstName: string;
        lastName: string;
        rollNumber: string;
        department: string;
        semester: number;
        batch: string;
        section?: string;
    };
};

const collegeSeed = {
    name: "Skill Lighthouse Test College",
    shortName: "SLHTEST",
    domain: "slhtest.edu",
    location: "Test City",
    website: "https://slhtest.edu"
};

const userSeeds: SeedUser[] = [
    {
        email: "superadmin.test@slh.com",
        password: "SuperAdmin@123",
        role: Role.SUPER_ADMIN
    },
    {
        email: "admin.test@slh.com",
        password: "Admin@12345",
        role: Role.ADMIN,
        collegeShortName: collegeSeed.shortName
    },
    {
        email: "student1.test@slh.com",
        password: "Student@123",
        role: Role.STUDENT,
        collegeShortName: collegeSeed.shortName,
        student: {
            firstName: "Aarav",
            lastName: "Verma",
            rollNumber: "SLH2026CS001",
            department: "Computer Science",
            semester: 6,
            batch: "2026",
            section: "A"
        }
    },
    {
        email: "student2.test@slh.com",
        password: "Student@123",
        role: Role.STUDENT,
        collegeShortName: collegeSeed.shortName,
        student: {
            firstName: "Meera",
            lastName: "Nair",
            rollNumber: "SLH2026CS002",
            department: "Computer Science",
            semester: 6,
            batch: "2026",
            section: "A"
        }
    }
];

async function ensureCollege(): Promise<College> {
    return prisma.college.upsert({
        where: { shortName: collegeSeed.shortName },
        update: {
            name: collegeSeed.name,
            domain: collegeSeed.domain,
            location: collegeSeed.location,
            website: collegeSeed.website
        },
        create: collegeSeed
    });
}

async function ensureUser(seed: SeedUser, collegeId: string | null): Promise<User> {
    const passwordHash = await bcrypt.hash(seed.password, 10);

    return prisma.user.upsert({
        where: { email: seed.email },
        update: {
            role: seed.role,
            passwordHash,
            collegeId
        },
        create: {
            email: seed.email,
            role: seed.role,
            passwordHash,
            collegeId
        }
    });
}

async function ensureStudentProfile(
    user: User,
    seed: NonNullable<SeedUser["student"]>,
    collegeId: string | null
): Promise<Student> {
    return prisma.student.upsert({
        where: { userId: user.id },
        update: {
            collegeId,
            firstName: seed.firstName,
            lastName: seed.lastName,
            rollNumber: seed.rollNumber,
            email: user.email,
            department: seed.department,
            semester: seed.semester,
            batch: seed.batch,
            section: seed.section ?? null
        },
        create: {
            userId: user.id,
            collegeId,
            firstName: seed.firstName,
            lastName: seed.lastName,
            rollNumber: seed.rollNumber,
            email: user.email,
            department: seed.department,
            semester: seed.semester,
            batch: seed.batch,
            section: seed.section ?? null
        }
    });
}

async function main() {
    const college = await ensureCollege();
    const created: Array<{
        email: string;
        password: string;
        role: Role;
        userId: string;
        studentId: string | null;
        collegeId: string | null;
    }> = [];

    for (const seed of userSeeds) {
        const collegeId =
            seed.collegeShortName === collegeSeed.shortName ? college.id : null;
        const user = await ensureUser(seed, collegeId);
        let studentId: string | null = null;

        if (seed.student) {
            const student = await ensureStudentProfile(user, seed.student, collegeId);
            studentId = student.id;
        }

        created.push({
            email: seed.email,
            password: seed.password,
            role: seed.role,
            userId: user.id,
            studentId,
            collegeId: user.collegeId
        });
    }

    console.log("Test users seeded successfully.");
    console.log("College:");
    console.table([
        {
            id: college.id,
            name: college.name,
            shortName: college.shortName
        }
    ]);
    console.log("Users:");
    console.table(created);
}

main()
    .catch((error) => {
        console.error("Failed to seed test users:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
