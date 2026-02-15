import "./env.js";
import express from "express";
import dsaRoutes from "./http/routes/dsa.routes.js";
import { DSARepository, prisma } from "@slh/database";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(express.json());

app.get("/", async (req, res) => {
    const repo = new DSARepository();
    try {
        await repo.healthCheck();
        res.json({ status: "ok", database: "connected" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Database connection failed" });
    }
});

app.use(limiter);
app.use("/dsa", dsaRoutes);

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Graceful Shutdown
const shutdown = async () => {
    console.log("Shutting down server...");
    server.close(async () => {
        console.log("HTTP server closed.");
        await prisma.$disconnect();
        console.log("Database disconnected.");
        process.exit(0);
    });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
