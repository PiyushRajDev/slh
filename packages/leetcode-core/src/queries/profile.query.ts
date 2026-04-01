export const profileQuery = `
query getProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      realName
      aboutMe
      ranking
      reputation
    }
    submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
    submissionCalendar
  }
}
`;
