export const submissionsQuery = `
query getRecentSubmissions($username: String!) {
  recentAcSubmissionList(username: $username) {
    title
    titleSlug
    timestamp
  }
}
`;
