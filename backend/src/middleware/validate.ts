import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { badRequest } from "../utils/app-error.js";

export function validateRequest(target: "query" | "params" | "body", schema: ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) return next(badRequest("Request validation failed", result.error.issues.map(({ path, message }) => ({ path: path.join("."), message }))));
    res.locals[target] = result.data;
    next();
  };
}
