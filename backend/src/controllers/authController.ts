import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { ADMIN_COOKIE, createAdminSession } from "../middleware/auth.js";
import { success } from "../utils/responses.js";

const cookieBase = { httpOnly: true, secure: env.nodeEnv === "production", sameSite: "lax" as const, path: "/api/v1/auth" };

export function startAdminSession(_req: Request, res: Response) {
  res.cookie(ADMIN_COOKIE, createAdminSession(), { ...cookieBase, maxAge: 8 * 60 * 60 * 1000 });
  return success(res, { authenticated: true }, {}, 201);
}

export function endAdminSession(_req: Request, res: Response) {
  res.clearCookie(ADMIN_COOKIE, cookieBase);
  return success(res, { authenticated: false });
}
