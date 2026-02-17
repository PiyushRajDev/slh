import { z } from "zod";

export const fullProfileSchema = z.object({
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
    submissionCalendar: z.string(),
  }).nullable(),

  userContestRanking: z.object({
    rating: z.number().nullable(),
    globalRanking: z.number().nullable(),
    attendedContestsCount: z.number().nullable(),
    topPercentage: z.number().nullable(),
  }).nullable(),

  userContestRankingHistory: z.array(
    z.object({
      rating: z.number(),
      ranking: z.number(),
      contest: z.object({
        title: z.string(),
        startTime: z.number(),
      }),
    })
  ).nullable(),

  recentAcSubmissionList: z.array(
    z.object({
      title: z.string(),
      titleSlug: z.string(),
      timestamp: z.string(),
    })
  ).nullable(),
});

export type FullProfileRaw =
  z.infer<typeof fullProfileSchema>;
