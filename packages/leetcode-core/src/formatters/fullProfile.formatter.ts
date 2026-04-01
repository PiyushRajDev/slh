import { FullProfileRaw } from "../validators/fullProfile.schema";

export function formatFullProfile(data: FullProfileRaw) {

  if (!data.matchedUser) {
    throw new Error("User not found");
  }

  const user = data.matchedUser;

  const difficultyStats = {
    easy: 0,
    medium: 0,
    hard: 0,
    total: 0
  };

  for (const item of user.submitStatsGlobal.acSubmissionNum) {
    if (item.difficulty === "Easy") difficultyStats.easy = item.count;
    if (item.difficulty === "Medium") difficultyStats.medium = item.count;
    if (item.difficulty === "Hard") difficultyStats.hard = item.count;
    if (item.difficulty === "All") difficultyStats.total = item.count;
  }

  return {
    profile: {
      username: user.username,
      realName: user.profile.realName,
      aboutMe: user.profile.aboutMe,
      ranking: user.profile.ranking,
      reputation: user.profile.reputation
    },

    difficultyStats,

    submissionCalendar: JSON.parse(user.submissionCalendar),

    contest: data.userContestRanking ?? null,

    contestHistory: data.userContestRankingHistory ?? [],

    recentSubmissions: data.recentAcSubmissionList ?? []
  };
}
