export class CodeforcesScraper {
    async scrape(username: string) {
        console.log(`[CodeforcesScraper] Fetching data for ${username}...`);
        try {
            return {
                username,
                platform: "codeforces",
                solved: {
                    easy: Math.floor(Math.random() * 40),
                    medium: Math.floor(Math.random() * 20),
                    hard: Math.floor(Math.random() * 5)
                },
                total: 0,
                rating: 1200 + Math.floor(Math.random() * 400),
                last_synced_at: new Date()
            };
        } catch (error) {
            console.error(`[CodeforcesScraper] Failed to scrape ${username}:`, error);
            throw error;
        }
    }
}
