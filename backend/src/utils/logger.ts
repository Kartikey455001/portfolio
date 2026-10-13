import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.nodeEnv === "development" ? "debug" : "info",
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "res.headers.set-cookie", "accessToken", "refreshToken", "token"],
    censor: "[REDACTED]",
  },
  base: { service: "portfolio-api", version: "1.0.0" },
  timestamp: pino.stdTimeFunctions.isoTime,
});
