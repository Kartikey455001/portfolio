import { Router } from "express";
import { githubWebhook } from "../controllers/githubWebhookController.js";

export const webhookRouter = Router();
webhookRouter.post("/github", githubWebhook);
