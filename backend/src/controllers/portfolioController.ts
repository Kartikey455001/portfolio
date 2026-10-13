import type { Request, Response } from "express";
import { success } from "../utils/responses.js";
import { getProjects, getProjectBySlug, getGitHubProfile, getGitHubRepositories } from "../services/projects/projectService.js";
import { getLeetCodeActivity, getLeetCodeProfile, getLeetCodeStats } from "../services/leetcode/leetcodeService.js";
import { getAchievements, getExperience, getProfile, getSkills } from "../services/portfolioContentService.js";
import { getIntegrationStatus } from "../services/integrationStatusService.js";

export async function listProjects(_req: Request, res: Response) {
  const result = await getProjects();
  return success(res, result.data, { dataSource: result.dataSource, fetchedAt: result.fetchedAt, stale: result.stale });
}

export async function projectBySlug(req: Request, res: Response) {
  const result = await getProjectBySlug(String(req.params.slug ?? ""));
  return success(res, result.data, { dataSource: result.dataSource });
}

export async function githubProfile(_req: Request, res: Response) {
  const result = await getGitHubProfile();
  return success(res, result.data, { dataSource: result.dataSource, fetchedAt: result.fetchedAt, stale: result.stale });
}

export async function githubRepositories(_req: Request, res: Response) {
  const result = await getGitHubRepositories();
  return success(res, result.data, { dataSource: result.dataSource, fetchedAt: result.fetchedAt, stale: result.stale });
}

export async function githubSyncStatus(_req: Request, res: Response) {
  const result = await getIntegrationStatus();
  return success(res, result.github);
}

export async function leetCodeStats(_req: Request, res: Response) {
  const result = await getLeetCodeStats();
  return success(res, result.data, { dataSource: result.dataSource, fetchedAt: result.fetchedAt, stale: result.stale });
}

export async function leetCodeActivity(_req: Request, res: Response) {
  const result = await getLeetCodeActivity();
  return success(res, result.data, { dataSource: result.dataSource, fetchedAt: result.fetchedAt, stale: result.stale });
}

export async function leetCodeProfile(_req: Request, res: Response) {
  const result = await getLeetCodeProfile();
  return success(res, result.data, { dataSource: result.dataSource, fetchedAt: result.fetchedAt, stale: result.stale });
}

export async function leetCodeSyncStatus(_req: Request, res: Response) {
  const result = await getIntegrationStatus();
  return success(res, result.leetcode);
}

export async function profile(_req: Request, res: Response) { const result = await getProfile(); return success(res, result.data, { dataSource: result.dataSource }); }
export async function achievements(_req: Request, res: Response) { const result = await getAchievements(); return success(res, result.data, { dataSource: result.dataSource }); }
export async function experience(_req: Request, res: Response) { const result = await getExperience(); return success(res, result.data, { dataSource: result.dataSource }); }
export async function skills(_req: Request, res: Response) { const result = await getSkills(); return success(res, result.data, { dataSource: result.dataSource }); }
export async function integrations(_req: Request, res: Response) {
  const result = await getIntegrationStatus();
  return success(res, result);
}
