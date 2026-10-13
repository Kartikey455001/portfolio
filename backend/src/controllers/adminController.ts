import type { Request, Response } from "express";
import { success } from "../utils/responses.js";
import { syncService } from "../services/sync/syncService.js";
import { getSyncStatus } from "../services/integrationStatusService.js";

export async function syncGitHub(_req: Request, res: Response) { return success(res, await syncService.syncGitHub()); }
export async function syncLeetCode(_req: Request, res: Response) { return success(res, await syncService.syncLeetCode()); }
export async function syncAll(_req: Request, res: Response) { return success(res, await syncService.syncAll()); }
export async function syncStatus(_req: Request, res: Response) { return success(res, await getSyncStatus()); }
