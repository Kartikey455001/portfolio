import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import { logger } from "../utils/logger.js";
import { failure } from "../utils/responses.js";

export const notFoundHandler: RequestHandler = (req, res) => failure(res, "NOT_FOUND", `Route ${req.method} ${req.path} was not found`, undefined, 404);

export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, _next) => {
  if (error instanceof AppError) {
    if (error.statusCode >= 500) logger.error({ err: error, path: req.path, method: req.method }, "Request failed");
    return failure(res, error.code, error.message, env.nodeEnv === "production" ? undefined : error.details, error.statusCode);
  }
  if (error instanceof ZodError) {
    logger.warn({ issues: error.issues.map(({ path, message }) => ({ path: path.join("."), message })) }, "Upstream payload failed validation");
    return failure(res, "UPSTREAM_INVALID_RESPONSE", "An external provider returned invalid data", undefined, 502);
  }
  if (error instanceof SyntaxError && "status" in error && error.status === 400) return failure(res, "INVALID_JSON", "Request body must be valid JSON", undefined, 400);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") return failure(res, "NOT_FOUND", "Resource not found", undefined, 404);
    if (error.code === "P2002") return failure(res, "CONFLICT", "A record with these values already exists", undefined, 409);
  }
  const status = typeof error === "object" && error !== null && "status" in error && typeof error.status === "number" ? error.status : 500;
  logger.error({ err: error, path: req.path, method: req.method }, "Unhandled request error");
  return failure(res, status === 429 ? "RATE_LIMITED" : "INTERNAL_ERROR", status === 429 ? "Too many requests" : "An unexpected error occurred", undefined, status >= 400 && status < 600 ? status : 500);
};
