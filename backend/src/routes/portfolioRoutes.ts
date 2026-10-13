import { Router } from "express";
import * as controller from "../controllers/portfolioController.js";
import { validateRequest } from "../middleware/validate.js";
import { slugParam } from "../validators/schemas.js";

export const portfolioRouter = Router();

portfolioRouter.get("/projects", controller.listProjects);
portfolioRouter.get("/projects/:slug", validateRequest("params", slugParam), controller.projectBySlug);
portfolioRouter.get("/github/profile", controller.githubProfile);
portfolioRouter.get("/github/repositories", controller.githubRepositories);
portfolioRouter.get("/github/sync", controller.githubSyncStatus);

portfolioRouter.get("/leetcode/stats", controller.leetCodeStats);
portfolioRouter.get("/leetcode/activity", controller.leetCodeActivity);
portfolioRouter.get("/leetcode/profile", controller.leetCodeProfile);
portfolioRouter.get("/leetcode/sync", controller.leetCodeSyncStatus);

portfolioRouter.get("/profile", controller.profile);
portfolioRouter.get("/achievements", controller.achievements);
portfolioRouter.get("/experience", controller.experience);
portfolioRouter.get("/skills", controller.skills);
portfolioRouter.get("/integrations/status", controller.integrations);
