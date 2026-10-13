import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { mockGithubRepositories } from "../mock-data.js";
import { syncService } from "../sync/syncService.js";
import { cacheDelete, cacheGet, cacheSet } from "../../utils/cache.js";
import { singleFlight } from "../../utils/single-flight.js";
import { notFound } from "../../utils/app-error.js";
import type { DataSource } from "../../types/domain.js";

const TTL_SECONDS = 30 * 60;
const TTL_MS = TTL_SECONDS * 1000;
type ProjectSnapshot = { data: Record<string, unknown>[]; dataSource: DataSource; fetchedAt: string | null; stale: boolean };

function mapProject(project: { id: string; githubId: bigint | null; name: string; slug: string; description: string | null; htmlUrl: string; liveUrl: string | null; language: string | null; topics: string[]; stars: number; forks: number; readme: string | null; imageUrl: string | null; owner: string | null; defaultBranch: string | null; isFeatured: boolean; displayOrder: number; githubUpdatedAt: Date | null }) {
  return { ...project, githubId: project.githubId?.toString() ?? null, githubUpdatedAt: project.githubUpdatedAt?.toISOString() ?? null };
}

function mapMock() {
  return mockGithubRepositories.map((repo, index) => ({
    id: `mock-${repo.id}`, githubId: null, name: repo.name.replaceAll("-", " "), slug: repo.name, description: repo.description,
    htmlUrl: repo.htmlUrl, liveUrl: repo.homepage, language: repo.language, topics: repo.topics, stars: repo.stars, forks: repo.forks,
    readme: null, imageUrl: null, owner: repo.owner, defaultBranch: repo.defaultBranch, isFeatured: index === 0, displayOrder: index,
    githubUpdatedAt: repo.updatedAt,
  }));
}

async function snapshotFromDatabase(): Promise<ProjectSnapshot> {
  const [projects, lastSync] = await Promise.all([
    prisma.project.findMany({ where: { isAvailable: true }, orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }, { githubUpdatedAt: "desc" }, { stars: "desc" }] }),
    prisma.syncLog.findFirst({ where: { provider: "github", operation: "syncRepositories", status: "success" }, orderBy: { completedAt: "desc" }, select: { completedAt: true } }),
  ]);
  const fetchedAt = lastSync?.completedAt?.toISOString() ?? null;
  return { data: projects.map(mapProject), dataSource: "cache", fetchedAt, stale: !fetchedAt || Date.now() - Date.parse(fetchedAt) > TTL_MS };
}

export async function getProjects(forceRefresh = false): Promise<ProjectSnapshot> {
  const redisSnapshot = !forceRefresh ? await cacheGet<ProjectSnapshot>("portfolio:projects:v1") : undefined;
  if (redisSnapshot && !redisSnapshot.stale) return redisSnapshot;
  return singleFlight("projects:get", async () => {
    let current = await snapshotFromDatabase();
    if (forceRefresh || current.stale) {
      if (env.githubUsername) {
        try {
          const synced = await syncService.syncGitHub();
          if (synced.status === "success") current = { ...(await snapshotFromDatabase()), dataSource: "live", fetchedAt: synced.fetchedAt, stale: false };
        } catch {
          current = { ...(await snapshotFromDatabase()), dataSource: "cache", stale: true };
        }
      }
    }
    if (current.data.length === 0) {
      const mock: ProjectSnapshot = { data: mapMock(), dataSource: "mock", fetchedAt: null, stale: false };
      await cacheSet("portfolio:projects:v1", mock, TTL_SECONDS);
      return mock;
    }
    await cacheSet("portfolio:projects:v1", current, TTL_SECONDS);
    return current;
  });
}

export async function invalidateProjectsCache() { await cacheDelete("portfolio:projects:v1"); }

export async function getProjectBySlug(slug: string) {
  await getProjects();
  const project = await prisma.project.findUnique({ where: { slug } });
  if (project) return { data: mapProject(project), dataSource: "cache" as const };
  const mock = mapMock().find((item) => item.slug === slug);
  if (mock) return { data: mock, dataSource: "mock" as const };
  throw notFound("Project not found");
}

export async function getGitHubRepositories() {
  const snapshot = await getProjects();
  return snapshot;
}

export async function getGitHubProfile() {
  const setting = await prisma.adminSetting.findUnique({ where: { key: "github:profile" } });
  const lastSync = await prisma.syncLog.findFirst({ where: { provider: "github", operation: "syncRepositories", status: "success" }, orderBy: { completedAt: "desc" }, select: { completedAt: true } });
  const fresh = Boolean(lastSync?.completedAt && Date.now() - lastSync.completedAt.getTime() <= TTL_MS);
  if (setting?.value && fresh) return { data: setting.value, dataSource: "cache" as const, fetchedAt: lastSync?.completedAt?.toISOString() ?? null, stale: false };
  if (env.githubUsername && !fresh) {
    try {
      await syncService.syncGitHub();
      const profile = await prisma.adminSetting.findUnique({ where: { key: "github:profile" } });
      if (profile?.value) return { data: profile.value, dataSource: "live" as const, fetchedAt: new Date().toISOString(), stale: false };
    } catch { /* Mock profile is clearly labelled when no cached profile exists. */ }
  }
  if (setting?.value) return { data: setting.value, dataSource: "cache" as const, fetchedAt: lastSync?.completedAt?.toISOString() ?? null, stale: true };
  return { data: { login: env.githubUsername ?? "kartikeyupadhyay", name: "Kartikey Upadhyay", htmlUrl: "https://github.com/kartikeyupadhyay", publicRepos: 5 }, dataSource: "mock" as const, fetchedAt: null, stale: false };
}
