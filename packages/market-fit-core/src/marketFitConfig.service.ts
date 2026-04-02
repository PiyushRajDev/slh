import { getMarketFitCoreRuntime } from "./runtime";

const CACHE_TTL_MS = 5 * 60 * 1000;

type ConfigCache = {
    loadedAt: number;
    values: Map<string, { valueNumber: number | null; valueString: string | null; valueJson: unknown }>;
};

let configCache: ConfigCache | null = null;

async function loadConfig(forceRefresh = false): Promise<ConfigCache> {
    if (!forceRefresh && configCache && Date.now() - configCache.loadedAt < CACHE_TTL_MS) {
        return configCache;
    }

    const { prisma } = getMarketFitCoreRuntime();
    const rows = await prisma.marketFitConfig.findMany();

    configCache = {
        loadedAt: Date.now(),
        values: new Map(
            rows.map((row) => [
                row.key,
                {
                    valueNumber: row.valueNumber,
                    valueString: row.valueString,
                    valueJson: row.valueJson
                }
            ])
        )
    };

    return configCache;
}

async function getRequiredConfig(key: string) {
    const cache = await loadConfig();
    const value = cache.values.get(key);
    if (!value) {
        throw new Error(`Market Fit config "${key}" is missing. Run the market-fit seed script.`);
    }

    return value;
}

export const marketFitConfigService = {
    async getNumber(key: string): Promise<number> {
        const value = await getRequiredConfig(key);
        if (typeof value.valueNumber !== "number") {
            throw new Error(`Market Fit config "${key}" is not a number.`);
        }

        return value.valueNumber;
    },

    async getString(key: string): Promise<string> {
        const value = await getRequiredConfig(key);
        if (typeof value.valueString !== "string") {
            throw new Error(`Market Fit config "${key}" is not a string.`);
        }

        return value.valueString;
    },

    async getJson<T>(key: string): Promise<T> {
        const value = await getRequiredConfig(key);
        return value.valueJson as T;
    },

    clearCache(): void {
        configCache = null;
    }
};
