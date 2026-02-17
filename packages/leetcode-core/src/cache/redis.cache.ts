import { ICache, CacheEntry } from "../contracts/cache.contract";
import { Redis } from "ioredis";

export class RedisCache implements ICache {
    constructor(private redis: Redis) { }

    async get<T>(key: string): Promise<CacheEntry<T> | null> {
        const raw = await this.redis.get(key);
        return raw ? JSON.parse(raw) : null;
    }

    async set<T>(key: string, value: T, ttl: number): Promise<void> {
        const entry: CacheEntry<T> = {
            data: value,
            updatedAt: Date.now(),
        };

        await this.redis.set(key, JSON.stringify(entry), "EX", ttl);
    }

    async acquireLock(key: string, ttl: number): Promise<boolean> {
        const result = await this.redis.set(
            `lock:${key}`,
            "1",
            "EX",
            ttl,
            "NX"
        );

        return result === "OK";
    }



    async releaseLock(key: string): Promise<void> {
        await this.redis.del(`lock:${key}`);
    }
}
