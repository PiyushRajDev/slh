import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
    authenticate,
    Permission,
    requireAnyPermission
} from "../middleware/auth.middleware";
import { marketFitController } from "../controllers/marketFitController";

const router = Router();

const marketFitLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many market fit requests. Please try again shortly."
    }
});

router.use(authenticate);

router.post(
    "/analyze",
    requireAnyPermission(Permission.MARKET_FIT_ANALYZE_SELF, Permission.MARKET_FIT_ANALYZE_ANY),
    marketFitLimiter,
    marketFitController.analyze
);
router.get(
    "/report/:userId",
    requireAnyPermission(
        Permission.MARKET_FIT_REPORT_READ_SELF,
        Permission.MARKET_FIT_REPORT_READ_ANY
    ),
    marketFitController.getLatestReport
);
router.get(
    "/status/:jobId",
    requireAnyPermission(
        Permission.MARKET_FIT_STATUS_READ_SELF,
        Permission.MARKET_FIT_STATUS_READ_ANY
    ),
    marketFitController.getStatus
);

export default router;
