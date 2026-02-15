export const contestHistoryQuery = `
query getContestHistory($username: String!) {
  userContestRankingHistory(username: $username) {
    rating
    ranking
    contest {
      title
      startTime
    }
  }
}
`;
