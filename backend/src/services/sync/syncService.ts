import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { githubService } from "../github/githubService.js";
import { LeetCodeGraphQLProvider } from "../leetcode/leetcodeGraphQLProvider.js";
import { leetCodeStatsSchema } from "../../validators/schemas.js";
import { AppError } from "../../utils/app-error.js";
import { logger } from "../../utils/logger.js";
import { slugify } from "../../utils/slug.js";
import { singleFlight } from "../../utils/single-flight.js";
import { cacheDelete } from "../../utils/cache.js";
import type { DataSource, LeetCodeStatsData } from "../../types/domain.js";
import type { LeetCodeProvider } from "../leetcode/leetcodeProvider.js";
import { MockLeetCodeProvider } from "../leetcode/mockLeetCodeProvider.js";

type SyncResult<T = undefined> = { provider: string; status: "success" | "skipped"; itemsFetched: number; dataSource: DataSource; data?: T; fetchedAt: string };

async function recordSkipped(provider: string, operation: string): Promise<SyncResult> {
  const now = new Date();
  await prisma.integration.upsert({ where: { provider }, create: { provider, status: "NOT_CONNECTED", lastAttemptedSync: now }, update: { status: "NOT_CONNECTED", lastAttemptedSync: now } }).catch(() => undefined);
  return { provider, status: "skipped", itemsFetched: 0, dataSource: "mock", fetchedAt: now.toISOString() };
}

async function withSyncLog<T>(provider: string, operation: string, task: () => Promise<{ data: T; items: number }>, deliveryId?: string): Promise<SyncResult<T>> {
  const log = await prisma.syncLog.create({ data: { provider, operation, status: "running", ...(deliveryId ? { deliveryId } : {}) } });
  const started = Date.now();
  const attemptedAt = new Date();
  await prisma.integration.upsert({ where: { provider }, create: { provider, status: "CONNECTED", lastAttemptedSync: attemptedAt }, update: { lastAttemptedSync: attemptedAt } });
  try {
    const result = await task();
    const completedAt = new Date();
    const durationMs = Date.now() - started;
    await prisma.$transaction([
      prisma.syncLog.update({ where: { id: log.id }, data: { status: "success", completedAt, itemsFetched: result.items, durationMs } }),
      prisma.integration.update({ where: { provider }, data: { status: "CONNECTED", lastSuccessfulSync: completedAt, itemsFetched: result.items, lastError: null } }),
    ]);
    if (provider === "github") await cacheDelete("portfolio:projects:v1");
    if (provider === "leetcode") await cacheDelete("portfolio:leetcode:stats:v1");
    logger.info({ provider, operation, itemsFetched: result.items, duration: durationMs, status: "success" }, "Provider sync completed");
    return { provider, status: "success", itemsFetched: result.items, dataSource: "live", data: result.data, fetchedAt: completedAt.toISOString() };
  } catch (error) {
    const completedAt = new Date();
    const durationMs = Date.now() - started;
    const message = error instanceof Error ? error.message.slice(0, 1000) : "Provider sync failed";
    const code = error instanceof AppError ? error.code : "PROVIDER_ERROR";
    const status = code === "PERMISSION_REQUIRED" ? "PERMISSION_REQUIRED" : code === "TOKEN_EXPIRED" ? "TOKEN_EXPIRED" : "ERROR";
    await prisma.$transaction([
      prisma.syncLog.update({ where: { id: log.id }, data: { status: "error", completedAt, durationMs, errorMessage: message } }),
      prisma.integration.update({ where: { provider }, data: { status, lastError: message } }),
    ]);
    logger.error({ provider, operation, duration: durationMs, status: "error", code, message }, "Provider sync failed");
    throw error;
  }
}

export class SyncService {
  constructor(private readonly leetCodeProvider: LeetCodeProvider = new LeetCodeGraphQLProvider()) {}

  syncGitHub(deliveryId?: string) {
    if (!env.githubUsername) return recordSkipped("github", "repositories");
    return singleFlight(`sync:github${deliveryId ? `:${deliveryId}` : ""}`, async () => {
      if (deliveryId) {
        const existing = await prisma.syncLog.findUnique({ where: { deliveryId } });
        if (existing) return { provider: "github", status: "success" as const, itemsFetched: existing.itemsFetched, dataSource: "cache" as const, fetchedAt: existing.completedAt?.toISOString() ?? existing.startedAt.toISOString() };
      }
      return withSyncLog("github", "syncRepositories", async () => {
      const [profile, repositories] = await Promise.all([githubService.getUserProfile(), githubService.getRepositories()]);
      const featuredIds = new Set((await prisma.project.findMany({ where: { isFeatured: true }, select: { githubId: true } })).map((project) => String(project.githubId)));
      const ordered = [...repositories].sort((a, b) => Number(featuredIds.has(String(b.id))) - Number(featuredIds.has(String(a.id))) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || b.stars - a.stars);
      const readmeCandidates = ordered.slice(0, 12);
      const readmes = await Promise.all(readmeCandidates.map((repo) => githubService.getReadme(repo.owner, repo.name).catch(() => "")));
      for (const [index, repo] of ordered.entries()) {
        const readmeIndex = readmeCandidates.findIndex((candidate) => candidate.id === repo.id);
        const current = await prisma.project.findUnique({ where: { githubId: BigInt(repo.id) }, select: { id: true, isFeatured: true, displayOrder: true, readme: true } });
        await prisma.project.upsert({
          where: { githubId: BigInt(repo.id) },
          create: {
            githubId: BigInt(repo.id), name: repo.name, slug: slugify(repo.name), description: repo.description,
            htmlUrl: repo.htmlUrl, liveUrl: repo.homepage, language: repo.language, topics: repo.topics, stars: repo.stars, forks: repo.forks,
            readme: readmeIndex >= 0 ? readmes[readmeIndex] || null : null, owner: repo.owner, defaultBranch: repo.defaultBranch,
            isFeatured: false, displayOrder: 100 + index, githubUpdatedAt: new Date(repo.updatedAt), isAvailable: true,
          },
          update: {
            name: repo.name, slug: slugify(repo.name), description: repo.description, htmlUrl: repo.htmlUrl, liveUrl: repo.homepage,
            language: repo.language, topics: repo.topics, stars: repo.stars, forks: repo.forks,
            ...(readmeIndex >= 0 && readmes[readmeIndex] ? { readme: readmes[readmeIndex] } : {}), owner: repo.owner,
            defaultBranch: repo.defaultBranch, displayOrder: current?.isFeatured ? current.displayOrder : 100 + index,
            githubUpdatedAt: new Date(repo.updatedAt), isAvailable: true,
          },
        });
      }
      await prisma.adminSetting.upsert({ where: { key: "github:profile" }, create: { key: "github:profile", value: profile as unknown as Prisma.InputJsonValue }, update: { value: profile as unknown as Prisma.InputJsonValue } });
      return { data: repositories.length, items: repositories.length };
      }, deliveryId);
    });
  }

  syncLeetCode() {
    if (!env.leetcodeUsername) return recordSkipped("leetcode", "stats");
    return singleFlight("sync:leetcode", () => withSyncLog("leetcode", "syncStats", async () => {
      const username = env.leetcodeUsername!;
      const [profile, stats, submissionCalendar] = await Promise.all([
        this.leetCodeProvider.getProfile(username), this.leetCodeProvider.getStats(username), this.leetCodeProvider.getSubmissionCalendar(username),
      ]);
      const fetchedAt = new Date().toISOString();
      const validated = leetCodeStatsSchema.parse({ ...stats, username: profile.username, ranking: profile.ranking ?? stats.ranking, submissionCalendar, fetchedAt });
      await prisma.leetCodeStats.upsert({
        where: { username: validated.username }, create: this.toLeetCodeCreate(validated), update: this.toLeetCodeUpdate(validated),
      });
      return { data: validated, items: 1 };
    }));
  }

  async syncAll() {
    const results = await Promise.allSettled([this.syncGitHub(), this.syncLeetCode()]);
    return results.map((result, index) => result.status === "fulfilled" ? result.value : { provider: ["github", "leetcode"][index], status: "error", error: result.reason instanceof Error ? result.reason.message : "Sync failed" });
  }

  private toLeetCodeCreate(stats: LeetCodeStatsData) {
    return { username: stats.username, totalSolved: stats.totalSolved, easySolved: stats.easySolved, mediumSolved: stats.mediumSolved, hardSolved: stats.hardSolved, ranking: stats.ranking, currentStreak: stats.currentStreak, longestStreak: stats.longestStreak, totalSubmissions: stats.totalSubmissions, submissionCalendar: stats.submissionCalendar as Prisma.InputJsonValue, fetchedAt: new Date(stats.fetchedAt) };
  }
  private toLeetCodeUpdate(stats: LeetCodeStatsData) { return this.toLeetCodeCreate(stats); }
}

export const syncService = new SyncService();
