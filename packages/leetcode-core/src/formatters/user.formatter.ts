import { z } from "zod";
import { userSchema } from "../validators/user.schema";

type MatchedUser = NonNullable<
  z.infer<typeof userSchema>["matchedUser"]
>;

export function formatUser(user: MatchedUser) {
  const stats = user.submitStatsGlobal.acSubmissionNum;

  const totalSolved =
    stats.find(s => s.difficulty === "All")?.count ?? 0;

  return {
    username: user.username,
    realName: user.profile.realName,
    ranking: user.profile.ranking,
    reputation: user.profile.reputation,
    totalSolved,
  };
}
