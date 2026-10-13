import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export async function health(_req: Request, res: Response) {
  let database = "connected";
  try { await prisma.$queryRaw`SELECT 1`; }
  catch { database = "disconnected"; }
  const status = database === "connected" ? "ok" : "degraded";
  return res.status(database === "connected" ? 200 : 503).json({ status, database, timestamp: new Date().toISOString(), version: "1.0.0" });
}
