import "dotenv/config";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { startScheduler, stopScheduler } from "./jobs/scheduler.js";
import { closeCache } from "./utils/cache.js";
import { logger } from "./utils/logger.js";

const server = app.listen(env.port, () => {
  logger.info({ port: env.port, environment: env.nodeEnv }, "Portfolio API listening");
  startScheduler();
});

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Shutting down portfolio API");
  stopScheduler();
  server.close(async (error) => {
    if (error) logger.error({ err: error }, "HTTP server close failed");
    await Promise.allSettled([prisma.$disconnect(), closeCache()]);
    process.exit(error ? 1 : 0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => { void shutdown("SIGTERM"); });
process.on("SIGINT", () => { void shutdown("SIGINT"); });
