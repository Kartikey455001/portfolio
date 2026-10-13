import { z } from "zod";

const optional = z.preprocess((value) => value === "" ? undefined : value, z.string().optional());
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: optional,
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  ADMIN_API_TOKEN: optional,
  JWT_SECRET: optional,
  REDIS_URL: optional,
  ENABLE_SCHEDULER: z.preprocess((value) => value === undefined ? true : value === true || value === "true", z.boolean()),
  GITHUB_USERNAME: optional,
  GITHUB_TOKEN: optional,
  GITHUB_WEBHOOK_SECRET: optional,
  LEETCODE_USERNAME: optional,
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
}

if (parsed.data.NODE_ENV === "production") {
  for (const key of ["DATABASE_URL", "ADMIN_API_TOKEN", "JWT_SECRET"] as const) {
    if (!parsed.data[key]) throw new Error(`${key} is required in production`);
  }
  if ((parsed.data.JWT_SECRET?.length ?? 0) < 32) throw new Error("JWT_SECRET must contain at least 32 characters");
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  databaseUrl: parsed.data.DATABASE_URL ?? "postgresql://portfolio:portfolio_dev_only@localhost:5433/portfolio?schema=public",
  frontendUrls: parsed.data.FRONTEND_URL.split(",").map((url) => url.trim()).filter(Boolean),
  adminApiToken: parsed.data.ADMIN_API_TOKEN,
  jwtSecret: parsed.data.JWT_SECRET ?? "local-development-secret-change-before-deploy-32-chars",
  redisUrl: parsed.data.REDIS_URL,
  schedulerEnabled: parsed.data.ENABLE_SCHEDULER,
  githubUsername: parsed.data.GITHUB_USERNAME,
  githubToken: parsed.data.GITHUB_TOKEN,
  githubWebhookSecret: parsed.data.GITHUB_WEBHOOK_SECRET,
  leetcodeUsername: parsed.data.LEETCODE_USERNAME,
} as const;
