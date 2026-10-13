import { createClient, type RedisClientType } from "redis";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

let client: RedisClientType | undefined;
let connecting: Promise<void> | undefined;

async function getRedis() {
  if (!env.redisUrl) return undefined;
  if (!client) {
    client = createClient({ url: env.redisUrl });
    client.on("error", (error) => logger.warn({ err: error }, "Redis cache unavailable; using database cache"));
  }
  if (!client.isOpen) {
    connecting ??= client.connect().then(() => undefined).catch((error: unknown) => {
      connecting = undefined;
      logger.warn({ err: error }, "Redis connection failed; using database cache");
    });
    await connecting;
  }
  return client?.isReady ? client : undefined;
}

export async function cacheGet<T>(key: string): Promise<T | undefined> {
  try {
    const redis = await getRedis();
    const value = await redis?.get(key);
    return value ? JSON.parse(value) as T : undefined;
  } catch (error) {
    logger.warn({ err: error, key }, "Redis cache read failed");
    return undefined;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const redis = await getRedis();
    if (redis) await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    logger.warn({ err: error, key }, "Redis cache write failed");
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    const redis = await getRedis();
    if (redis) await redis.del(key);
  } catch (error) {
    logger.warn({ err: error, key }, "Redis cache invalidation failed");
  }
}

export async function closeCache() {
  if (client?.isOpen) await client.quit();
}
