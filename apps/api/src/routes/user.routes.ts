import { Router } from "express";
import { userService } from "../bootstrap/leetcode";

const router = Router();

router.get("/:username", async (req, res) => {
  try {
    const data = await userService.getUser(req.params.username);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
