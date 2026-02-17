import {
  LeetCodeClient,
  FullProfileScraper,
  UserService,
  RedisCache
} from "@slh/leetcode-core";

import Redis from "ioredis";

const redis = new Redis();
const cache = new RedisCache(redis);

const client = new LeetCodeClient();
const scraper = new FullProfileScraper(client);

export const leetcodeService =
  new UserService(cache, scraper);
