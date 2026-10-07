import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { buildAlerts } from "./alerts.service.js";

const querySchema = z.object({
  horas: z.coerce.number().int().min(1).max(168).default(24),
});

export const alertsRouter = Router();

alertsRouter.get("/", authenticate, async (request, response, next) => {
  try {
    const { horas } = querySchema.parse(request.query);
    return response.status(200).json(await buildAlerts(horas));
  } catch (error) {
    next(error);
  }
});
