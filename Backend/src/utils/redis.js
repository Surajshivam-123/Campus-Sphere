import Redis from "ioredis";

let redisClient = null;
let redisAvailable = false;

// In-memory fallback store when Redis is unavailable
const memoryStore = new Map();

export const getRedisClient = () => {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 200, 1000);
      },
    });

    redisClient.on("connect", () => {
      redisAvailable = true;
      console.log("✅ Redis connected");
    });
    redisClient.on("error", (err) => {
      redisAvailable = false;
      if (err.code !== "ECONNREFUSED") {
        console.error("Redis error:", err.message);
      }
    });
    redisClient.on("close", () => { redisAvailable = false; });
  }
  return redisClient;
};

// Memory store helpers with TTL support
const memSet = (key, value, ttlSeconds) => {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  memoryStore.set(key, { value, expiresAt });
};

const memGet = (key) => {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
};

const memDel = (...keys) => keys.forEach((k) => memoryStore.delete(k));

/**
 * Get cached value. Falls back to in-memory store if Redis is unavailable.
 */
export const cacheGet = async (key) => {
  try {
    const client = getRedisClient();
    if (redisAvailable) {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    }
  } catch { /* fall through */ }
  return memGet(key);
};

/**
 * Set cache with TTL in seconds. Falls back to in-memory store if Redis is unavailable.
 */
export const cacheSet = async (key, value, ttlSeconds = 300) => {
  try {
    const client = getRedisClient();
    if (redisAvailable) {
      await client.setex(key, ttlSeconds, JSON.stringify(value));
      return;
    }
  } catch { /* fall through */ }
  memSet(key, value, ttlSeconds);
};

/**
 * Delete one or more cache keys.
 */
export const cacheDel = async (...keys) => {
  try {
    const client = getRedisClient();
    if (redisAvailable && keys.length) await client.del(...keys);
  } catch { /* ignore */ }
  memDel(...keys);
};
