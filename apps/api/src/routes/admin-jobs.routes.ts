import { Router, Response } from "express";
import prisma from "../db";
import {
    authenticate,
    AuthRequest,
    Permission,
    requirePermission,
} from "../middleware/auth.middleware";
import { getScopedPrismaClient } from "../scoped-db";
import { extractSkillsFromText } from "@slh/placement-engine";

const router = Router();

// All admin job routes require authentication + admin dashboard permission
router.use(authenticate, requirePermission(Permission.ADMIN_DASHBOARD_READ));

// ─────────────────────────────────────────────────
// COMPANIES
// ─────────────────────────────────────────────────

// POST /api/admin/companies
router.post("/companies", async (req: AuthRequest, res: Response) => {
    try {
        const principal = req.auth?.principal;
        if (!principal?.collegeId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { name, logoUrl, website, industry, size, location } = req.body;
        if (!name?.trim()) {
            res.status(400).json({ error: "Company name is required" });
            return;
        }

        const company = await prisma.company.create({
            data: {
                name: name.trim(),
                logoUrl: logoUrl?.trim() || null,
                website: website?.trim() || null,
                industry: industry?.trim() || null,
                size: size?.trim() || null,
                location: location?.trim() || null,
                collegeId: principal.collegeId,
            },
        });

        res.status(201).json({ company });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to create company";
        res.status(500).json({ error: message });
    }
});

// GET /api/admin/companies
router.get("/companies", async (req: AuthRequest, res: Response) => {
    try {
        const principal = req.auth?.principal;
        if (!principal) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const scopedDb = getScopedPrismaClient(principal) as any;
        const companies = await scopedDb.company.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: { select: { jobs: true } },
            },
        });

        res.status(200).json({ companies });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch companies";
        res.status(500).json({ error: message });
    }
});

// PUT /api/admin/companies/:id
router.put("/companies/:id", async (req: AuthRequest, res: Response) => {
    try {
        const principal = req.auth?.principal;
        if (!principal) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const scopedDb = getScopedPrismaClient(principal) as any;
        const id = String(req.params.id);
        const { name, logoUrl, website, industry, size, location } = req.body;

        const existing = await scopedDb.company.findFirst({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: "Company not found" });
            return;
        }

        const company = await prisma.company.update({
            where: { id },
            data: {
                ...(name?.trim() && { name: name.trim() }),
                logoUrl: logoUrl?.trim() ?? existing.logoUrl,
                website: website?.trim() ?? existing.website,
                industry: industry?.trim() ?? existing.industry,
                size: size?.trim() ?? existing.size,
                location: location?.trim() ?? existing.location,
            },
        });

        res.status(200).json({ company });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to update company";
        res.status(500).json({ error: message });
    }
});

// DELETE /api/admin/companies/:id
router.delete("/companies/:id", async (req: AuthRequest, res: Response) => {
    try {
        const principal = req.auth?.principal;
        if (!principal) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const scopedDb = getScopedPrismaClient(principal) as any;
        const id = String(req.params.id);

        const existing = await scopedDb.company.findFirst({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: "Company not found" });
            return;
        }

        // Remove associated jobs first (cascade safety)
        await prisma.job.deleteMany({ where: { companyId: id } });
        await prisma.company.delete({ where: { id } });

        res.status(200).json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to delete company";
        res.status(500).json({ error: message });
    }
});

// ─────────────────────────────────────────────────
// JOBS
// ─────────────────────────────────────────────────

// POST /api/admin/jobs
router.post("/jobs", async (req: AuthRequest, res: Response) => {
    try {
        const principal = req.auth?.principal;
        if (!principal?.collegeId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { title, description, descriptionUrl, ctc, eligibility, deadline, location, jobType, companyId } = req.body;

        if (!title?.trim()) {
            res.status(400).json({ error: "Job title is required" });
            return;
        }
        if (!description?.trim()) {
            res.status(400).json({ error: "Job description is required" });
            return;
        }
        if (!companyId) {
            res.status(400).json({ error: "Company is required" });
            return;
        }

        // Verify company belongs to this college
        const company = await prisma.company.findFirst({
            where: { id: companyId, collegeId: principal.collegeId },
        });
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }

        // Fetch capability catalog for skill extraction
        const catalog = await prisma.capability.findMany({
            select: { slug: true, name: true, synonyms: true },
        });

        const normalizedCatalog = catalog.map((c) => ({
            slug: c.slug,
            name: c.name,
            synonyms: Array.isArray(c.synonyms) ? (c.synonyms as string[]) : null,
        }));

        const { skills, capabilitySlugs } = extractSkillsFromText(description, normalizedCatalog);

        const job = await prisma.job.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                descriptionUrl: descriptionUrl?.trim() || null,
                skills,
                capabilitySlugs,
                ctc: ctc?.trim() || null,
                eligibility: eligibility?.trim() || null,
                deadline: deadline ? new Date(deadline) : null,
                location: location?.trim() || null,
                jobType: jobType?.trim() || null,
                companyId,
                collegeId: principal.collegeId,
            },
            include: { company: { select: { name: true, logoUrl: true } } },
        });

        res.status(201).json({ job });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to create job";
        res.status(500).json({ error: message });
    }
});

// GET /api/admin/jobs
router.get("/jobs", async (req: AuthRequest, res: Response) => {
    try {
        const principal = req.auth?.principal;
        if (!principal) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const scopedDb = getScopedPrismaClient(principal) as any;
        const jobs = await scopedDb.job.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                company: { select: { id: true, name: true, logoUrl: true } },
                _count: { select: { applications: true } },
            },
        });

        res.status(200).json({ jobs });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch jobs";
        res.status(500).json({ error: message });
    }
});

// PUT /api/admin/jobs/:id
router.put("/jobs/:id", async (req: AuthRequest, res: Response) => {
    try {
        const principal = req.auth?.principal;
        if (!principal?.collegeId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const scopedDb = getScopedPrismaClient(principal) as any;
        const id = String(req.params.id);

        const existing = await scopedDb.job.findFirst({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: "Job not found" });
            return;
        }

        const { title, description, descriptionUrl, ctc, eligibility, deadline, location, jobType } = req.body;

        // Re-extract skills if description changed
        let skills = existing.skills;
        let capabilitySlugs = existing.capabilitySlugs;
        if (description?.trim() && description.trim() !== existing.description) {
            const catalog = await prisma.capability.findMany({
                select: { slug: true, name: true, synonyms: true },
            });
            const normalizedCatalog = catalog.map((c) => ({
                slug: c.slug,
                name: c.name,
                synonyms: Array.isArray(c.synonyms) ? (c.synonyms as string[]) : null,
            }));
            const extracted = extractSkillsFromText(description, normalizedCatalog);
            skills = extracted.skills;
            capabilitySlugs = extracted.capabilitySlugs;
        }

        const job = await prisma.job.update({
            where: { id },
            data: {
                title: title?.trim() ?? existing.title,
                description: description?.trim() ?? existing.description,
                descriptionUrl: descriptionUrl?.trim() ?? existing.descriptionUrl,
                skills,
                capabilitySlugs,
                ctc: ctc?.trim() ?? existing.ctc,
                eligibility: eligibility?.trim() ?? existing.eligibility,
                deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : existing.deadline,
                location: location?.trim() ?? existing.location,
                jobType: jobType?.trim() ?? existing.jobType,
            },
            include: { company: { select: { name: true, logoUrl: true } } },
        });

        res.status(200).json({ job });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to update job";
        res.status(500).json({ error: message });
    }
});

// DELETE /api/admin/jobs/:id
router.delete("/jobs/:id", async (req: AuthRequest, res: Response) => {
    try {
        const principal = req.auth?.principal;
        if (!principal) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const scopedDb = getScopedPrismaClient(principal) as any;
        const id = String(req.params.id);

        const existing = await scopedDb.job.findFirst({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: "Job not found" });
            return;
        }

        await prisma.job.delete({ where: { id } });
        res.status(200).json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to delete job";
        res.status(500).json({ error: message });
    }
});

export default router;
