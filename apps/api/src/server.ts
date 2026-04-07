import "dotenv/config";
import app from "./app";
import prisma from "./db";
import { registerScheduledJobs, startSchedulerWorker } from "./services/scheduler";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server = app.listen(PORT, async () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
    await registerScheduledJobs();
    startSchedulerWorker();
});

const shutdown = async (signal: string) => {
    console.log(`[shutdown] Received ${signal} — closing server`);
    server.close(async () => {
        try {
            await prisma.$disconnect();
            console.log("[shutdown] Database disconnected cleanly");
        } catch (err) {
            console.error("[shutdown] Error disconnecting DB:", err);
        }
        process.exit(0);
    });

    // Force exit after 10s if server.close() hangs
    setTimeout(() => {
        console.error("[shutdown] Forced exit after 10s timeout");
        process.exit(1);
    }, 10_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
