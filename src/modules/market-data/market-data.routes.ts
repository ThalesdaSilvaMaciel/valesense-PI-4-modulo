import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { listMarketData } from "./market-data.mock.js";

const querySchema = z.object({ dias: z.coerce.number().int().min(1).max(30).default(7) });
export const marketDataRouter = Router();

marketDataRouter.get("/", authenticate, (request, response, next) => {
  try {
    const { dias } = querySchema.parse(request.query);
    return response.status(200).json({ data: listMarketData(dias), source: "mock" });
  } catch (error) {
    next(error);
  }
});
