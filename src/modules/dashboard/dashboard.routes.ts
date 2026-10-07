import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { buildDashboard } from "./dashboard.service.js";

const querySchema = z.object({
  dias: z.coerce.number().int().min(1).max(30).default(7),
  horas: z.coerce.number().int().min(1).max(168).default(24),
});

export const dashboardRouter = Router();

dashboardRouter.get("/", authenticate, async (request, response, next) => {
  try {
    const { dias, horas } = querySchema.parse(request.query);
    return response.status(200).json(await buildDashboard(dias, horas));
  } catch (error) {
    next(error);
  }
});
