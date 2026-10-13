import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { logger } from "./utils/logger.js";
import { forbidden } from "./utils/app-error.js";
import { failure } from "./utils/responses.js";
import { health } from "./controllers/healthController.js";
import { portfolioRouter } from "./routes/portfolioRoutes.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { webhookRouter } from "./routes/webhookRoutes.js";

export const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || env.frontendUrls.includes(origin)) return callback(null, true);
    callback(forbidden("Origin is not allowed by CORS"));
  },
}));
app.use(pinoHttp({
  logger,
  serializers: {
    req(request) {
      let path = request.url ?? "/";
      try { path = new URL(path, "http://localhost").pathname; } catch { path = "/"; }
      return { method: request.method, url: path, remoteAddress: request.socket.remoteAddress };
    },
  },
}));

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false,
  handler: (_req, res) => failure(res, "RATE_LIMITED", "Too many requests; try again later", undefined, 429),
});
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false,
  handler: (_req, res) => failure(res, "RATE_LIMITED", "Too many administrative requests; try again later", undefined, 429),
});

app.get("/", (_req, res) => res.json({ service: "Kartikey Portfolio API", version: "1.0.0", docs: "/docs/API.md", health: "/health", api: "/api/v1" }));
app.get("/health", health);
app.use("/api/v1", publicLimiter);

// Preserve exact webhook bytes for HMAC verification before JSON parsing.
app.use("/api/v1/webhooks", express.raw({ type: "application/json", limit: "1mb" }), webhookRouter);
app.use(express.json({ limit: "1mb", strict: true }));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));
app.use(cookieParser());

app.use("/api/v1", portfolioRouter);
app.use("/api/v1/admin", adminLimiter, adminRouter);
app.use("/api/v1/auth", authRouter);
app.use(notFoundHandler);
app.use(errorHandler);
