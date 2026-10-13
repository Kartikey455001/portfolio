import type { Response } from "express";

export function success<T>(res: Response, data: T, meta: Record<string, unknown> = {}, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, meta });
}

export function failure(res: Response, code: string, message: string, details?: unknown, statusCode = 500) {
  return res.status(statusCode).json({ success: false, error: { code, message, ...(details ? { details } : {}) } });
}
