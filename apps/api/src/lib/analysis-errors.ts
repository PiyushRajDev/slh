export type AnalysisErrorCode =
    | 'ANALYSIS_FAILED'
    | 'ANALYSIS_TIMEOUT'
    | 'GITHUB_NOT_CONNECTED'
    | 'GITHUB_RATE_LIMITED'
    | 'INVALID_REPOSITORY_URL'
    | 'PRIVATE_REPOSITORY'
    | 'REPOSITORY_NOT_FOUND'
    | 'REPOSITORY_OWNER_MISMATCH'
    | 'STREAM_TIMEOUT';

export class AnalysisRequestError extends Error {
    readonly code: AnalysisErrorCode;
    readonly status: number;

    constructor(code: AnalysisErrorCode, message: string, status: number) {
        super(message);
        this.name = 'AnalysisRequestError';
        this.code = code;
        this.status = status;
    }
}

export function classifyAnalysisFailure(message: string | undefined): {
    code: AnalysisErrorCode;
    message: string;
} {
    const normalizedMessage = message?.trim() || 'Analysis failed';
    const lowerMessage = normalizedMessage.toLowerCase();

    if (
        lowerMessage.includes('github account not connected') ||
        lowerMessage.includes('missing githubaccesstoken')
    ) {
        return {
            code: 'GITHUB_NOT_CONNECTED',
            message:
                'GitHub account not connected. Please connect your GitHub account first.'
        };
    }

    if (
        lowerMessage.includes('does not belong to your connected github account') ||
        lowerMessage.includes('repository owner mismatch')
    ) {
        return {
            code: 'REPOSITORY_OWNER_MISMATCH',
            message:
                'This repository does not belong to your connected GitHub account.'
        };
    }

    if (lowerMessage.includes('private repository')) {
        return {
            code: 'PRIVATE_REPOSITORY',
            message:
                'This repository is private. SLH can only analyze public repositories.'
        };
    }

    if (lowerMessage.includes('rate limit')) {
        return {
            code: 'GITHUB_RATE_LIMITED',
            message:
                'GitHub rate limits are currently slowing us down. Please try again in a few minutes.'
        };
    }

    if (
        lowerMessage.includes('timed out') ||
        lowerMessage.includes('timeout')
    ) {
        return {
            code: 'ANALYSIS_TIMEOUT',
            message:
                'This repository is too large for our current limits. We are working on supporting larger codebases.'
        };
    }

    if (lowerMessage.includes('not found')) {
        return {
            code: 'REPOSITORY_NOT_FOUND',
            message:
                'We could not access that repository. Check the URL and make sure it is public.'
        };
    }

    return {
        code: 'ANALYSIS_FAILED',
        message: normalizedMessage
    };
}
