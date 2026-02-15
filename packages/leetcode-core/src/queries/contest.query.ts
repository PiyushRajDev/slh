export const contestQuery = `
query getContest($username: String!) {
  userContestRanking(username: $username) {
    rating
    globalRanking
    attendedContestsCount
    topPercentage
  }
}
`;
