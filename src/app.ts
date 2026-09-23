import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { marketDataRouter } from "./modules/market-data/market-data.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { weatherDataRouter } from "./modules/weather-data/weather-data.routes.js";

export const app = express();
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.get("/health", (_request, response) => response.status(200).json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/market-data", marketDataRouter);
app.use("/api/weather-data", weatherDataRouter);
app.use(errorHandler);
