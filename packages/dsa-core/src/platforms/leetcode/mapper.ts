import { UnifiedDSAProfile } from "@slh/shared";

export function leetcodeMapper(username: string, data: any): UnifiedDSAProfile {
    return {
        platform: "leetcode",
        username: username,
        easy_count: data.easySolved || 0,
        medium_count: data.mediumSolved || 0,
        hard_count: data.hardSolved || 0,
        total_solved: data.totalSolved || 0,
        rating: data.rating || 0,
        last_synced_at: new Date(),
    };
}
