import { Router, Response } from "express";
import * as bcrypt from "bcrypt";
import prisma from "../db";
import {
    authenticate,
    AuthRequest,
    Permission,
    requirePermission
} from "../middleware/auth.middleware";
import { getScopedPrismaClient } from "../scoped-db";
import {
    sendCollegeWelcomeEmail,
    sendStudentWelcomeEmail,
} from "../services/emailService";

const router = Router();

router.use(authenticate);

router.post(
    "/college",
    requirePermission(Permission.COLLEGE_ONBOARD_CREATE),
    async (req: AuthRequest, res: Response) => {
    try {
        const {
            name,
            shortName,
            domain,
            location,
            website,
            adminEmail,
            adminPassword,
            adminFirstName,
            adminLastName,
        } = req.body;

        if (!name || !shortName || !adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
            res.status(400).json({
                error: "Required: name, shortName, adminEmail, adminPassword, adminFirstName, adminLastName",
            });
            return;
        }

        if (adminPassword.length < 8) {
            res.status(400).json({ error: "adminPassword must be at least 8 characters" });
            return;
        }

        const existingCollege = await prisma.college.findUnique({ where: { shortName } });
        if (existingCollege) {
            res.status(409).json({ error: `College with shortName "${shortName}" already exists` });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (existingUser) {
            res.status(409).json({ error: `User with email "${adminEmail}" already exists` });
            return;
        }

        const passwordHash = await bcrypt.hash(adminPassword, 12);

        const college = await prisma.$transaction(async (tx) => {
            const newCollege = await tx.college.create({
                data: { name, shortName, domain, location, website },
            });

            await tx.user.create({
                data: {
                    email: adminEmail,
                    passwordHash,
                    role: "ADMIN",
                    collegeId: newCollege.id,
                },
            });

            return newCollege;
        });

        const loginUrl = `${process.env.FRONTEND_URL ?? "https://app.skilllighthouse.com"}/login`;
        await sendCollegeWelcomeEmail({
            collegeId: college.id,
            collegeName: college.name,
            adminEmail,
            adminName: `${adminFirstName} ${adminLastName}`,
            loginUrl,
        }).catch(() => {
            // email failure is non-fatal
        });

        res.status(201).json({
            college: {
                id: college.id,
                name: college.name,
                shortName: college.shortName,
                domain: college.domain,
                location: college.location,
                website: college.website,
                createdAt: college.createdAt,
            },
            adminEmail,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to onboard college";
        res.status(500).json({ error: message });
    }
});

// ───────────────────────────────────────────────────────────────────
// POST /api/onboard/colleges/:collegeId/bulk-import
// SUPER_ADMIN or college ADMIN — bulk-creates students
// Body: { students: [{ firstName, lastName, rollNumber, email,
//                      department, semester, batch, section? }] }
// Temp password per student: SLH@<rollNumber>  (must change on login)
// Returns: { created, skipped, errors }
// ───────────────────────────────────────────────────────────────────

interface StudentImportRow {
    firstName: string;
    lastName: string;
    rollNumber: string;
    email: string;
    department: string;
    semester: number;
    batch: string;
    section?: string;
}

router.post(
    "/colleges/:collegeId/bulk-import",
    requirePermission(Permission.STUDENT_BULK_IMPORT),
    async (req: AuthRequest, res: Response) => {
    try {
        const principal = req.auth?.principal;
        if (!principal) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const scopedDb = getScopedPrismaClient(principal);
        const collegeId = req.params.collegeId as string;

        // If principal is an ADMIN, they are already scoped by the scopedDb.
        // We can check if they are trying to import for another college explicitly here for better error message
        // but scopedDb would prevent it anyway by not finding the college or failing the transaction.
        if (principal.role === "ADMIN" && principal.collegeId !== collegeId) {
            res.status(403).json({ error: "You can only import students for your own college" });
            return;
        }

        const college = await scopedDb.college.findUnique({ where: { id: collegeId } });
        if (!college) {
            res.status(404).json({ error: "College not found" });
            return;
        }

        const students: StudentImportRow[] = req.body.students;
        if (!Array.isArray(students) || students.length === 0) {
            res.status(400).json({ error: "Body must contain a non-empty students array" });
            return;
        }
        if (students.length > 500) {
            res.status(400).json({ error: "Maximum 500 students per import batch" });
            return;
        }

        // Pre-validate all rows before processing
        for (let i = 0; i < students.length; i++) {
            const row = students[i];
            if (row.semester != null && (isNaN(Number(row.semester)) || Number(row.semester) < 1)) {
                res.status(400).json({ error: `Row ${i + 1}: semester must be a positive integer` });
                return;
            }
        }

        const results = {
            created: 0,
            skipped: 0,
            errors: [] as Array<{ row: number; email: string; reason: string }>,
        };

        const loginUrl = `${process.env.FRONTEND_URL ?? "https://app.skilllighthouse.com"}/login`;

        for (let i = 0; i < students.length; i++) {
            const row = students[i];

            // Basic field validation
            if (!row.firstName || !row.lastName || !row.rollNumber || !row.email ||
                !row.department || !row.semester || !row.batch) {
                results.errors.push({
                    row: i + 1,
                    email: row.email ?? "",
                    reason: "Missing required fields: firstName, lastName, rollNumber, email, department, semester, batch",
                });
                continue;
            }

            // Check duplicates by email or rollNumber
            const existing = await scopedDb.student.findFirst({
                where: { OR: [{ email: row.email }, { rollNumber: row.rollNumber }] },
                select: { id: true },
            });
            if (existing) {
                results.skipped++;
                continue;
            }

            const existingUser = await scopedDb.user.findUnique({ where: { email: row.email } });
            if (existingUser) {
                results.skipped++;
                continue;
            }

            const tempPassword = `SLH@${row.rollNumber}`;
            const passwordHash = await bcrypt.hash(tempPassword, 10);

            try {
                const created = await scopedDb.$transaction(async (tx: any) => {
                    const user = await tx.user.create({
                        data: {
                            email: row.email,
                            passwordHash,
                            role: "STUDENT",
                            collegeId,
                        },
                    });

                    const student = await tx.student.create({
                        data: {
                            userId: user.id,
                            collegeId,
                            firstName: row.firstName,
                            lastName: row.lastName,
                            rollNumber: row.rollNumber,
                            email: row.email,
                            department: row.department,
                            semester: Number(row.semester),
                            batch: row.batch,
                            section: row.section,
                        },
                    });

                    return { studentId: student.id };
                });

                results.created++;

                // Send welcome email — non-fatal
                await sendStudentWelcomeEmail({
                    studentId: created.studentId,
                    email: row.email,
                    firstName: row.firstName,
                    collegeName: college.name,
                    loginUrl,
                }).catch(() => {});
            } catch {
                results.errors.push({ row: i + 1, email: row.email, reason: "Database write failed" });
            }
        }

        res.status(200).json({
            collegeId,
            ...results,
            total: students.length,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Bulk import failed";
        res.status(500).json({ error: message });
    }
});

export default router;
