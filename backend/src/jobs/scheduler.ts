import cron from "node-cron";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { syncService } from "../services/sync/syncService.js";

const jobs: ReturnType<typeof cron.schedule>[] = [];

export function startScheduler() {
  if (!env.schedulerEnabled) return;
  const schedule = (expression: string, provider: string, task: () => Promise<unknown>) => {
    jobs.push(cron.schedule(expression, async () => {
      try { await task(); }
      catch (error) { logger.warn({ err: error, provider }, "Scheduled provider sync failed; cached data is retained"); }
    }, { noOverlap: true, name: `${provider}-sync` }));
  };
  schedule("*/30 * * * *", "github", () => syncService.syncGitHub());
  schedule("15,45 * * * *", "leetcode", () => syncService.syncLeetCode());
  logger.info({ jobs: jobs.length }, "Background sync scheduler started");
}

export function stopScheduler() { jobs.forEach((job) => job.stop()); }
