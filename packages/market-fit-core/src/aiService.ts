import axios from "axios";

type StructuredRequest = {
    systemPrompt: string;
    userPrompt: string;
    schemaHint: string;
    temperature?: number;
    maxTokens?: number;
};

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJsonObject(content: string): string {
    const fencedMatch = content.match(/```json\s*([\s\S]*?)```/i);
    if (fencedMatch?.[1]) {
        return fencedMatch[1].trim();
    }

    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
        return content.slice(firstBrace, lastBrace + 1);
    }

    throw new Error("AI response did not contain a JSON object");
}

class AiService {
    private nextAllowedAt = 0;

    isEnabled(): boolean {
        return Boolean(process.env.OPENAI_API_KEY && this.modelName());
    }

    private modelName(): string | undefined {
        return process.env.OPENAI_MODEL ?? process.env.AI_MODEL;
    }

    private async waitForRateLimit(): Promise<void> {
        const requestsPerMinute = Math.max(1, Number(process.env.AI_REQUESTS_PER_MINUTE ?? 30));
        const minIntervalMs = Math.ceil(60_000 / requestsPerMinute);
        const now = Date.now();

        if (this.nextAllowedAt > now) {
            await sleep(this.nextAllowedAt - now);
        }

        this.nextAllowedAt = Math.max(this.nextAllowedAt, Date.now()) + minIntervalMs;
    }

    async generateStructuredObject<T>(request: StructuredRequest): Promise<T> {
        if (!this.isEnabled()) {
            throw new Error("AI service is not configured");
        }

        const apiKey = process.env.OPENAI_API_KEY!;
        const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
        const model = this.modelName()!;
        const attempts = Math.max(1, Number(process.env.AI_MAX_RETRIES ?? 3));

        let lastError: unknown;

        for (let attempt = 1; attempt <= attempts; attempt += 1) {
            try {
                await this.waitForRateLimit();

                const response = await axios.post(
                    `${baseUrl}/chat/completions`,
                    {
                        model,
                        temperature: request.temperature ?? 0.1,
                        max_tokens: request.maxTokens ?? 900,
                        response_format: { type: "json_object" },
                        messages: [
                            {
                                role: "system",
                                content: `${request.systemPrompt}\nReturn JSON only. Schema:\n${request.schemaHint}`
                            },
                            {
                                role: "user",
                                content: request.userPrompt
                            }
                        ]
                    },
                    {
                        timeout: Number(process.env.AI_TIMEOUT_MS ?? 25_000),
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                const content = response.data?.choices?.[0]?.message?.content;
                if (typeof content !== "string" || !content.trim()) {
                    throw new Error("AI response was empty");
                }

                return JSON.parse(extractJsonObject(content)) as T;
            } catch (error) {
                lastError = error;
                if (attempt < attempts) {
                    await sleep(500 * 2 ** (attempt - 1));
                    continue;
                }
            }
        }

        throw lastError instanceof Error ? lastError : new Error("AI request failed");
    }
}

export const aiService = new AiService();
