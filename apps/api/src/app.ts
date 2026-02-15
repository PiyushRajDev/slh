import express from "express";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/user.routes";

const app = express();

app.set("trust proxy", 1); // important behind proxy

app.use(express.json());

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

app.use("/leetcode/user", leetcodeLimiter, userRoutes);

export default app;
