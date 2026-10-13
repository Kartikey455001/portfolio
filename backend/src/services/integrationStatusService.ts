import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";

const present = (status: string) => status.toLowerCase();

export async function getIntegrationStatus() {
  const rows = await prisma.integration.findMany({ where: { provider: { in: ["github", "leetcode"] } } });
  const byProvider = new Map(rows.map((row) => [row.provider, row]));
  const github = byProvider.get("github");
  const leetcode = byProvider.get("leetcode");
  return {
    github: { status: present(github?.status ?? (env.githubUsername ? "CONNECTED" : "NOT_CONNECTED")), lastSuccessfulSync: github?.lastSuccessfulSync?.toISOString() ?? null, lastAttemptedSync: github?.lastAttemptedSync?.toISOString() ?? null, itemsFetched: github?.itemsFetched ?? 0 },
    leetcode: { status: present(leetcode?.status ?? (env.leetcodeUsername ? "CONNECTED" : "NOT_CONNECTED")), lastSuccessfulSync: leetcode?.lastSuccessfulSync?.toISOString() ?? null, lastAttemptedSync: leetcode?.lastAttemptedSync?.toISOString() ?? null, itemsFetched: leetcode?.itemsFetched ?? 0 },
  };
}

export async function getSyncStatus() {
  const [integrations, recentRuns] = await Promise.all([
    prisma.integration.findMany({ where: { provider: { in: ["github", "leetcode"] } }, select: { provider: true, status: true, lastSuccessfulSync: true, lastAttemptedSync: true, itemsFetched: true, lastError: true } }),
    prisma.syncLog.findMany({ orderBy: { startedAt: "desc" }, take: 30, select: { provider: true, operation: true, status: true, startedAt: true, completedAt: true, itemsFetched: true, durationMs: true, errorMessage: true } }),
  ]);
  return {
    integrations: integrations.map((integration) => ({ ...integration, lastSuccessfulSync: integration.lastSuccessfulSync?.toISOString() ?? null, lastAttemptedSync: integration.lastAttemptedSync?.toISOString() ?? null })),
    recentRuns: recentRuns.map((run) => ({ ...run, startedAt: run.startedAt.toISOString(), completedAt: run.completedAt?.toISOString() ?? null })),
  };
}
