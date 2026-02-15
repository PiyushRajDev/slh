import { z } from "zod";

export const getProfileSchema = z.object({
  studentId: z.string().min(3).max(50),
  platform: z.enum(["leetcode", "codeforces"]),
});
