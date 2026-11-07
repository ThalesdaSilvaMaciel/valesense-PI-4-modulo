import type { Request } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";

const message = { error: "Muitas tentativas. Tente novamente em alguns minutos." };
const emailSchema = z.string().trim().email();

function getNormalizedEmail(request: Request) {
  const email = request.body?.email;
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

const limiterOptions = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message,
};

// Os contadores ficam em memória e são reiniciados com a API nesta fase.
export const authIpLimiter = rateLimit({
  ...limiterOptions,
  limit: 10,
});

export const loginAccountLimiter = rateLimit({
  ...limiterOptions,
  limit: 5,
  skipSuccessfulRequests: true,
  skip: (request) => !emailSchema.safeParse(getNormalizedEmail(request)).success,
  keyGenerator: getNormalizedEmail,
});
