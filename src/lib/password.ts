import { z } from "zod";

export const MAX_PASSWORD_BYTES = 72;

export const newPasswordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .refine(
    (value) => Buffer.byteLength(value, "utf8") <= MAX_PASSWORD_BYTES,
    `A senha deve ter no máximo ${MAX_PASSWORD_BYTES} bytes (caracteres acentuados ocupam mais de 1 byte)`,
  );

export const loginPasswordSchema = z.string().min(1).max(1024);
