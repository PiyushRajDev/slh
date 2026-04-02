import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes";
import authRouter from "./routes/auth.routes";
import githubAuthRouter from "./routes/github.auth.routes";
import analysisRouter from "./routes/analysis";
import streamRouter from "./routes/stream.routes";
import jriRouter from "./routes/jri.routes";
import publicRouter from "./routes/public.routes";
import adminRouter from "./routes/admin.routes";
import onboardRouter from "./routes/onboard.routes";
import studentRouter from "./routes/student.routes";
import marketFitRouter from "./routes/market-fit.routes";
import { leetcodeLimiter } from "./auth/rate-limit";

const app = express();

app.set("trust proxy", 1); // important behind proxy

app.use(express.json());
app.use(cookieParser());

// CORS configuration - allowing origins dynamically from environment
const rawAllowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
    : [];

const allowedOrigins = [
    process.env.FRONTEND_URL,
    ...rawAllowedOrigins
].filter(Boolean) as string[];

// Dynamic CORS origin function
const checkOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow if no origin is specified (server-to-server or non-browser)
    if (!origin) return callback(null, true);

    // Explicitly allow if it's the frontend URL or a localhost variant
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.startsWith("http://localhost:") ||
                      origin === process.env.FRONTEND_URL;

    if (isAllowed) {
        callback(null, true);
    } else {
        console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
        callback(null, false); // Callback with false instead of error to avoid crashing
    }
};

app.use(cors({
    origin: checkOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200 // Ensure Preflight requests return 200 OK
}));

app.use("/auth", authRouter);
app.use("/auth", githubAuthRouter);
app.use("/leetcode/user", leetcodeLimiter, userRoutes);
app.use("/api/projects", streamRouter);
app.use("/api/projects", analysisRouter);
app.use("/api/jri", jriRouter);
app.use("/api/public", publicRouter);
app.use("/api/admin", adminRouter);
app.use("/api/onboard", onboardRouter);
app.use("/api/students", studentRouter);
app.use("/market-fit", marketFitRouter);

export default app;
