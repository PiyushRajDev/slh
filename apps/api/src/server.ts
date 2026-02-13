import express from "express";
import dotenv from "dotenv";
import dsaRoutes from "./api/routes/dsa.routes";

import { db } from "../../../packages/database/src";
import helmet from "helmet";
import rateLimit from "express-rate-limit";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(express.json());

app.get("/", async (req, res) => {
    try {
        await db.$queryRaw`SELECT 1`;
        res.json({ status: "ok", database: "connected" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Database connection failed" });
    }
});

app.use(limiter);
app.use("/dsa", dsaRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
