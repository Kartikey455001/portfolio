import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { unauthorized } from "../utils/app-error.js";
import { signValue, verifySignature } from "../utils/token-crypto.js";

const ADMIN_COOKIE = "portfolio_admin";

function equalSecret(received: string, expected: string) {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!env.adminApiToken) return next(unauthorized("Admin authentication is not configured"));
  const authorization = req.header("authorization");
  if (authorization?.startsWith("Bearer ") && equalSecret(authorization.slice(7), env.adminApiToken)) return next();

  const session = req.cookies?.[ADMIN_COOKIE] as string | undefined;
  const [payload, signature] = session?.split(".") ?? [];
  if (payload && signature && verifySignature(payload, signature)) {
    try {
      const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub?: string; exp?: number };
      if (data.sub === "admin" && Number.isInteger(data.exp) && (data.exp ?? 0) > Date.now()) return next();
    } catch { /* Invalid cookie is treated as unauthenticated. */ }
  }
  next(unauthorized());
};

export const requireAdminApiToken: RequestHandler = (req, _res, next) => {
  if (!env.adminApiToken) return next(unauthorized("Admin authentication is not configured"));
  const authorization = req.header("authorization");
  if (authorization?.startsWith("Bearer ") && equalSecret(authorization.slice(7), env.adminApiToken)) return next();
  return next(unauthorized());
};

export function createAdminSession() {
  const payload = Buffer.from(JSON.stringify({ sub: "admin", exp: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  return `${payload}.${signValue(payload)}`;
}

export { ADMIN_COOKIE };
