import { Router } from "express";
import * as controller from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/auth.js";

export const adminRouter = Router();
adminRouter.use(requireAdmin);
adminRouter.get("/sync/status", controller.syncStatus);
adminRouter.post("/sync/github", controller.syncGitHub);
adminRouter.post("/sync/leetcode", controller.syncLeetCode);
adminRouter.post("/sync/all", controller.syncAll);
