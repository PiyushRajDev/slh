import pLimit from "p-limit";
import { IGraphQLClient } from "../contracts/client.contract";

const limiter = pLimit(2); // max 2 concurrent requests globally

export class LeetCodeClient implements IGraphQLClient {
    private endpoint = "https://leetcode.com/graphql";

    private lastRequestTime = 0;
    private readonly MIN_INTERVAL = 2000; // 2 seconds between calls

    async request<T>(
        query: string,
        variables: Record<string, unknown>
    ): Promise<T> {
        return limiter(() =>
            this.executeWithRetry<T>(query, variables)
        );
    }

    private async executeWithRetry<T>(
        query: string,
        variables: Record<string, unknown>
    ): Promise<T> {

        const MAX_RETRIES = 3;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            let res: Response | undefined;

            try {
                // 🔹 small jitter to avoid burst alignment
                await this.sleep(200 + Math.random() * 300);

                // 🔹 enforce minimum spacing between requests
                await this.ensureMinDelay();

                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000);

                res = await fetch(this.endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "SkillProof-SLH/1.0"
                    },
                    body: JSON.stringify({ query, variables }),
                    signal: controller.signal,
                });

                clearTimeout(timeout);

                if (!res.ok) {
                    const text = await res.text();
                    console.error("LeetCode Error Response:", text);
                    throw new Error(`HTTP ${res.status}`);
                }

                const json = await res.json();

                if (json.errors) {
                    throw new Error(JSON.stringify(json.errors));
                }

                return json.data;

            } catch (err) {
                if (attempt === MAX_RETRIES) {
                    throw err;
                }

                // 🔹 proper exponential backoff (capped at 5s)
                const backoffDelay = Math.min(
                    5000,
                    500 * 2 ** attempt
                );

                await this.sleep(backoffDelay);
            }
        }

        throw new Error("Unreachable");
    }

    /**
     * Ensures at least MIN_INTERVAL time between outgoing requests.
     * Prevents burst spikes.
     */
    private async ensureMinDelay() {
        const now = Date.now();
        const nextAllowedTime = this.lastRequestTime + this.MIN_INTERVAL;

        if (now < nextAllowedTime) {
            await this.sleep(nextAllowedTime - now);
        }

        this.lastRequestTime = Date.now();
    }

    private sleep(ms: number) {
        return new Promise(res => setTimeout(res, ms));
    }
}
