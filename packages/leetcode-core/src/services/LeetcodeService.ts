import { ICache, CacheEntry } from "../contracts/cache.contract";
import { IUserScraper } from "../contracts/scraper.contract";

export class UserService {
  private readonly TTL = 1800; // 30 min cache TTL
  private readonly REFRESH_INTERVAL = 30 * 60 * 1000; // background refresh
  private readonly LOCK_TTL = 30; // lock duration (seconds)

  // 🔒 Hard guard: minimum time between real fetches
  private readonly MIN_USER_FETCH_INTERVAL = 10 * 60 * 1000; // 10 minutes

  constructor(
    private cache: ICache,
    private scraper: IUserScraper
  ) {}

  async getUser(username: string) {
    const key = this.buildKey(username);

    const cached = await this.cache.get<any>(key);

    //Cold miss — but still lock protected
    if (!cached) {
      return this.fetchWithLock(username, key);
    }

    const now = Date.now();

    // HARD GUARD — prevent too frequent refetch
    if (
      now - cached.updatedAt < this.MIN_USER_FETCH_INTERVAL
    ) {
      return cached.data;
    }

    // Soft stale — background refresh only
    if (this.isStale(cached)) {
      void this.refreshInBackground(username, key);
    }

    return cached.data;
  }

  /**
   * Fetch safely using lock (prevents cache stampede)
   */
  private async fetchWithLock(username: string, key: string) {
    const locked = await this.cache.acquireLock(key, this.LOCK_TTL);

    if (!locked) {
      // Someone else is fetching → wait briefly then return cache
      await this.sleep(300);

      const retry = await this.cache.get<any>(key);
      if (retry) return retry.data;

      throw new Error("Fetch in progress, please retry");
    }

    try {
      const fresh = await this.scraper.fetch(username);
      await this.cache.set(key, fresh, this.TTL);
      return fresh;
    } finally {
      await this.cache.releaseLock(key);
    }
  }

  /**
   * Background refresh — non-blocking
   */
  private async refreshInBackground(username: string, key: string) {
    const locked = await this.cache.acquireLock(key, this.LOCK_TTL);
    if (!locked) return;

    try {
      const fresh = await this.scraper.fetch(username);
      await this.cache.set(key, fresh, this.TTL);
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

  private sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }
}
