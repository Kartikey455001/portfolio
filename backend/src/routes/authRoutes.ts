import { Router } from "express";
import { endAdminSession, startAdminSession } from "../controllers/authController.js";
import { requireAdmin, requireAdminApiToken } from "../middleware/auth.js";

export const authRouter = Router();
authRouter.post("/admin-session", requireAdminApiToken, startAdminSession);
authRouter.delete("/admin-session", requireAdmin, endAdminSession);
