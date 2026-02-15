import { ICache, CacheEntry } from "../contracts/cache.contract";
import { IUserScraper } from "../contracts/scraper.contract";

export class UserService {
  private readonly TTL = 1800;
  private readonly REFRESH_INTERVAL = 30 * 60 * 1000;
  private readonly LOCK_TTL = 30;

  constructor(
    private cache: ICache,
    private scraper: IUserScraper
  ) {}

  async getUser(username: string) {
    const key = this.buildKey(username);

    const cached = await this.cache.get<any>(key);

    if (!cached) {
      return this.fetchAndStore(username, key);
    }

    if (this.isStale(cached)) {
      void this.refreshInBackground(username, key);
    }

    return cached.data;
  }

  private async fetchAndStore(username: string, key: string) {
    const fresh = await this.scraper.fetch(username);
    await this.cache.set(key, fresh, this.TTL);
    return fresh;
  }

  private async refreshInBackground(username: string, key: string) {
    const locked = await this.cache.acquireLock(key, this.LOCK_TTL);
    if (!locked) return;

    try {
      await this.fetchAndStore(username, key);
    } catch (err) {
      console.error("Background refresh failed:", err);
    } finally {
      await this.cache.releaseLock(key);
    }
  }

  private isStale(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.updatedAt > this.REFRESH_INTERVAL;
  }

  private buildKey(username: string) {
    return `leetcode:user:${username}`;
  }
}
