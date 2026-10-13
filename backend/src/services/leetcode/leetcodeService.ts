import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { mockLeetCodeStats } from "../mock-data.js";
import { syncService } from "../sync/syncService.js";
import { cacheGet, cacheSet, cacheDelete } from "../../utils/cache.js";
import { singleFlight } from "../../utils/single-flight.js";
import { integrationError } from "../../utils/app-error.js";
import type { DataSource } from "../../types/domain.js";

const TTL_SECONDS = 45 * 60;
const TTL_MS = TTL_SECONDS * 1000;
type StatsSnapshot = { data: Record<string, unknown>; dataSource: DataSource; fetchedAt: string | null; stale: boolean };

function mapStats(row: { username: string; totalSolved: number; easySolved: number; mediumSolved: number; hardSolved: number; ranking: number | null; currentStreak: number; longestStreak: number; totalSubmissions: number; submissionCalendar: unknown; fetchedAt: Date }) {
  return { username: row.username, totalSolved: row.totalSolved, easySolved: row.easySolved, mediumSolved: row.mediumSolved, hardSolved: row.hardSolved, ranking: row.ranking, currentStreak: row.currentStreak, longestStreak: row.longestStreak, totalSubmissions: row.totalSubmissions, submissionCalendar: row.submissionCalendar, fetchedAt: row.fetchedAt.toISOString() };
}

export async function getLeetCodeStats(forceRefresh = false): Promise<StatsSnapshot> {
  const redisSnapshot = !forceRefresh ? await cacheGet<StatsSnapshot>("portfolio:leetcode:stats:v1") : undefined;
  if (redisSnapshot && !redisSnapshot.stale) return redisSnapshot;
  return singleFlight("leetcode:stats:get", async () => {
    const row = env.leetcodeUsername ? await prisma.leetCodeStats.findUnique({ where: { username: env.leetcodeUsername } }) : null;
    let current: StatsSnapshot | undefined;
    if (row) current = { data: mapStats(row), dataSource: "cache", fetchedAt: row.fetchedAt.toISOString(), stale: Date.now() - row.fetchedAt.getTime() > TTL_MS };
    if (env.leetcodeUsername && (forceRefresh || !current || current.stale)) {
      try {
        const result = await syncService.syncLeetCode();
        const fresh = await prisma.leetCodeStats.findUnique({ where: { username: env.leetcodeUsername } });
        if (fresh && result.status === "success") current = { data: mapStats(fresh), dataSource: "live", fetchedAt: fresh.fetchedAt.toISOString(), stale: false };
      } catch {
        if (!current) throw integrationError("LeetCode");
        current.stale = true;
      }
    }
    if (!current) {
      if (env.leetcodeUsername) throw integrationError("LeetCode");
      const mock = { ...mockLeetCodeStats, fetchedAt: null, ranking: null };
      current = { data: mock, dataSource: "mock", fetchedAt: null, stale: false };
    }
    await cacheSet("portfolio:leetcode:stats:v1", current, TTL_SECONDS);
    return current;
  });
}

export async function invalidateLeetCodeCache() { await cacheDelete("portfolio:leetcode:stats:v1"); }

export async function getLeetCodeProfile() {
  const snapshot = await getLeetCodeStats();
  return { data: { username: snapshot.data.username, ranking: snapshot.data.ranking }, dataSource: snapshot.dataSource, fetchedAt: snapshot.fetchedAt, stale: snapshot.stale };
}

export async function getLeetCodeActivity() {
  const snapshot = await getLeetCodeStats();
  return { data: { username: snapshot.data.username, submissionCalendar: snapshot.data.submissionCalendar }, dataSource: snapshot.dataSource, fetchedAt: snapshot.fetchedAt, stale: snapshot.stale };
}
