import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { getWeatherReadings } from "./weather-source.js";

const querySchema = z.object({
  horas: z.coerce.number().int().min(1).max(168).default(24),
});

export const weatherDataRouter = Router();

weatherDataRouter.get("/", authenticate, async (request, response, next) => {
  try {
    const { horas } = querySchema.parse(request.query);
    const { data, source } = await getWeatherReadings(horas);
    return response.status(200).json({ data, source, periodHours: horas });
  } catch (error) {
    next(error);
  }
});
