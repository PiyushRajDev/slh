import { cfClient } from "./packages/codeforces/src/client/cf.client";
import { UserService } from "./packages/leetcode-core/src/services/LeetcodeService";
import { FullProfileScraper } from "./packages/leetcode-core/src/scraper/fullProfile.scraper";
import { LeetCodeClient } from "./packages/leetcode-core/src/client/leetcode.client";

class MockCache {
    async get() { return null; }
    async set() {}
    async acquireLock() { return true; }
    async releaseLock() {}
}

async function run() {
    try {
        console.log("Testing CF Verification for tourist...");
        const [profile] = await cfClient.getUserInfo("tourist");
        const textToCheck = `${profile.firstName || ""} ${profile.lastName || ""} ${profile.organization || ""}`;
        console.log("CF textToCheck (should contain Gennady):", textToCheck);
        console.log("CF Verified with token 'xyz'?", textToCheck.includes("xyz"));
        console.log("CF Verified with token 'Gennady'?", textToCheck.includes("Gennady"));

        console.log("\nTesting Leetcode Verification for piyush_hax...");
        const client = new LeetCodeClient();
        const scraper = new FullProfileScraper(client as any);
        const userService = new UserService(new MockCache() as any, scraper);
        
        const verified1 = await userService.verify("piyush_hax", "xyz_fake_token");
        console.log("LC verified with 'xyz_fake_token':", verified1);
        
        // Use a username that we know exists or we're confident will return a profile.
        // We will just verify it does not throw an error and correctly returns false.

    } catch (err) {
        console.error("Test failed", err);
    } finally {
        process.exit();
    }
}
run();
