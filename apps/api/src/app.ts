import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
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

const app = express();

app.set("trust proxy", 1); // important behind proxy

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
}));

const leetcodeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, //adjust based on need 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please try again later."
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

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

export default app;
