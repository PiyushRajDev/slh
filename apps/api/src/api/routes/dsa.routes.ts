import { Router } from "express";
import { getProfile, refreshProfile } from "../controllers/dsa.controller";

const router = Router();

router.get("/:studentId/:platform", getProfile);
router.post("/:studentId/:platform/fetch", refreshProfile);

export default router;
