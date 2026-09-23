import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { listWeatherData } from "./weather-data.mock.js";

const querySchema = z.object({
  horas: z.coerce.number().int().min(1).max(168).default(24),
});

export const weatherDataRouter = Router();

weatherDataRouter.get("/", authenticate, (request, response, next) => {
  try {
    const { horas } = querySchema.parse(request.query);
    return response.status(200).json({
      data: listWeatherData(horas),
      source: "mock",
      periodHours: horas,
    });
  } catch (error) {
    next(error);
  }
});
