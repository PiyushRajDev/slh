export interface CFUserInfo {
  handle: string
  rating?: number
  maxRating?: number
  rank?: string
  maxRank?: string
  contribution?: number
  registrationTimeSeconds?: number
  avatar?: string
  firstName?: string
  lastName?: string
  organization?: string
}

export interface CFRatingChange {
  contestId: number
  contestName: string
  handle: string
  rank: number
  ratingUpdateTimeSeconds: number
  oldRating: number
  newRating: number
}

export interface CFProblem {
  contestId?: number
  index: string
  name: string
  rating?: number
  tags: string[]
}

export interface CFSubmission {
  id: number
  contestId?: number
  creationTimeSeconds: number
  verdict?: string
  programmingLanguage?: string
  problem: CFProblem
}

export interface CFExtractedProfile {
  handle: string
  extractedAt: number
  profile: CFUserInfo
  ratingHistory: CFRatingChange[]
  submissionCount: number
  submissions: CFSubmission[]
}

export interface CFJobData {
  handle: string
  requestedAt: number
}

export type CFSnapshot = CFExtractedProfile

export interface CFErrorSnapshot {
  handle: string
  error: string
  extractedAt: number
}