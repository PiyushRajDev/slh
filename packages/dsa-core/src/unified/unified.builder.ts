import { UnifiedDSAProfile } from "@slh/shared";
import { LeetCodeScraper } from "../platforms/leetcode/scraper.js";
import { leetcodeMapper } from "../platforms/leetcode/mapper.js";
import { CodeforcesScraper } from "../platforms/codeforces/scraper.js";
import { codeforcesMapper } from "../platforms/codeforces/mapper.js";

export async function buildUnifiedProfile(studentId: string, platform: string): Promise<UnifiedDSAProfile> {
    let rawData: any;

    if (platform === "leetcode") {
        const scraper = new LeetCodeScraper();
        rawData = await scraper.scrape(studentId);
        return leetcodeMapper(studentId, rawData);
    } else if (platform === "codeforces") {
        const scraper = new CodeforcesScraper();
        rawData = await scraper.scrape(studentId);
        return codeforcesMapper(studentId, rawData);
    } else {
        throw new Error(`Unsupported platform: ${platform}`);
    }
}
