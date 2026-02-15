import Redis from "ioredis";
import {
  LeetCodeClient,
  RedisCache,
  UserScraper,
  UserService,
} from "@slh/leetcode-core";

const redis = new Redis();

const client = new LeetCodeClient();
const cache = new RedisCache(redis);
const scraper = new UserScraper(client);

export const userService = new UserService(cache, scraper);
