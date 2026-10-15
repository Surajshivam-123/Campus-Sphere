import { describe, it, expect } from "vitest";
import { cacheSet, cacheGet, cacheDel, getRedisClient } from "../../src/utils/redis.js";

describe("Redis / Cache Utility", () => {
  it("should return a redis client instance", () => {
    const client = getRedisClient();
    expect(client).toBeDefined();
  });

  it("should set, get, and del values in cache (in-memory fallback when offline)", async () => {
    const testKey = "test:user:123";
    const testData = { name: "Alice", role: "admin" };

    // Set cache
    await cacheSet(testKey, testData, 60);

    // Get cache
    const retrieved = await cacheGet(testKey);
    expect(retrieved).toEqual(testData);

    // Delete cache
    await cacheDel(testKey);
    const afterDel = await cacheGet(testKey);
    expect(afterDel).toBeNull();
  });

  it("should return null for expired items in memory cache", async () => {
    const expiredKey = "test:expired:key";
    // Set TTL = -1 to expire immediately
    await cacheSet(expiredKey, "should_expire", -1);

    const val = await cacheGet(expiredKey);
    expect(val).toBeNull();
  });
});
