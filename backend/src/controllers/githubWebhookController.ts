import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import { success } from "../utils/responses.js";
import { syncService } from "../services/sync/syncService.js";

const payloadSchema = z.object({ repository: z.object({ full_name: z.string().min(1).max(255) }).optional(), action: z.string().optional() }).passthrough();

function verifySignature(body: Buffer, header: string | undefined) {
  if (!env.githubWebhookSecret) throw new AppError(503, "WEBHOOK_NOT_CONFIGURED", "GitHub webhook secret is not configured");
  if (!header || !/^sha256=[a-f0-9]{64}$/i.test(header)) return false;
  const expected = createHmac("sha256", env.githubWebhookSecret).update(body).digest();
  const received = Buffer.from(header.slice(7), "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function githubWebhook(req: Request, res: Response) {
  if (!Buffer.isBuffer(req.body)) throw new AppError(400, "INVALID_WEBHOOK", "Expected a JSON webhook body");
  if (!verifySignature(req.body, req.header("x-hub-signature-256"))) throw new AppError(401, "INVALID_WEBHOOK_SIGNATURE", "GitHub webhook signature is invalid");
  const deliveryId = req.header("x-github-delivery");
  const event = req.header("x-github-event");
  if (!deliveryId || deliveryId.length > 256 || !event) throw new AppError(400, "INVALID_WEBHOOK", "GitHub delivery headers are missing");
  let decoded: unknown;
  try { decoded = JSON.parse(req.body.toString("utf8")) as unknown; }
  catch { throw new AppError(400, "INVALID_WEBHOOK", "GitHub webhook payload is not valid JSON"); }
  const parsed = payloadSchema.safeParse(decoded);
  if (!parsed.success) throw new AppError(400, "INVALID_WEBHOOK", "GitHub webhook payload is invalid");
  if (event === "ping") return success(res, { accepted: true, event, action: "ignored" });
  const supported = event === "push" || (event === "repository" && ["created", "edited"].includes(parsed.data.action ?? ""));
  if (!supported) return success(res, { accepted: true, event, action: "ignored" });
  const duplicate = await prisma.syncLog.findUnique({ where: { deliveryId }, select: { id: true } });
  if (duplicate) return success(res, { accepted: true, duplicate: true });
  const result = await syncService.syncGitHub(deliveryId);
  return success(res, { accepted: true, event, result }, {}, 202);
}
