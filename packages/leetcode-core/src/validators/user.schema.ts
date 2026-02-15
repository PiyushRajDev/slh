import { z } from "zod";

export const userSchema = z.object({
  matchedUser: z.object({
    username: z.string(),
    profile: z.object({
      realName: z.string().nullable(),
      ranking: z.number().nullable(),
      reputation: z.number().nullable(),
    }),
    submitStatsGlobal: z.object({
      acSubmissionNum: z.array(
        z.object({
          difficulty: z.string(),
          count: z.number(),
        })
      ),
    }),
  }).nullable(),
});


export type UserRaw = z.infer<typeof userSchema>;
