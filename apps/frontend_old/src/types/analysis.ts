export interface AnalysisSummary {
    profileId: string
    displayName: string
    overallScore: number
    confidenceLevel: string
    reliabilityLevel: string
}

export interface DimensionScore {
    score: number
    max: number
}

export interface AnalysisReport {
    id: string
    repoUrl: string
    overallScore: number
    profileId: string
    confidenceLevel: string
    reliabilityLevel: string
    flagCount: number
    analyzerVersion: string
    createdAt: string
    report: {
        summary: AnalysisSummary
        details: {
            dimensions: {
                overallScore: number
                dimensions: {
                    codeQuality: DimensionScore
                    architecture: DimensionScore
                    testing: DimensionScore
                    git: DimensionScore
                    devops: DimensionScore
                }
            }
            antiGaming: {
                flags: Array<{ pattern: string; severity: string; description: string }>
                flagCount: number
            }
        }
    }
}
