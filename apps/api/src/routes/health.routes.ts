import { Router } from "express";
import prisma from "../db";

const router = Router();

router.get("/", async (_req, res) => {
    let dbStatus = "connected";
    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch {
        dbStatus = "disconnected";
    }
    res.status(dbStatus === "connected" ? 200 : 503).json({
        status: dbStatus === "connected" ? "ok" : "degraded",
        uptime: Math.floor(process.uptime()),
        version: process.env.npm_package_version ?? "unknown",
        db: dbStatus,
        ts: new Date().toISOString(),
    });
});

export default router;
