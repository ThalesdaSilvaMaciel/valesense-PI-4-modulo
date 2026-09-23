import { createHash, randomBytes } from "node:crypto";
import { env } from "../../config/env.js";
import { userRepository } from "./user.repository.js";

type PasswordResetToken = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
};

const resetTokens: PasswordResetToken[] = [];

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(email: string) {
  const user = await userRepository.findByEmail(email);
  if (!user || user.status !== "ACTIVE") return null;

  const now = new Date();
  resetTokens.forEach((record) => {
    if (record.userId === user.id && !record.usedAt) record.usedAt = now;
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000);
  resetTokens.push({ userId: user.id, tokenHash: hashToken(token), expiresAt });
  return { token, email: user.email, expiresAt };
}

export async function resetPassword(token: string, password: string) {
  const now = new Date();
  const tokenRecord = resetTokens.find(
    (record) => record.tokenHash === hashToken(token) && !record.usedAt && record.expiresAt > now,
  );
  if (!tokenRecord) return false;

  const user = await userRepository.updatePassword(tokenRecord.userId, password);
  if (!user || user.status !== "ACTIVE") return false;

  resetTokens.forEach((record) => {
    if (record.userId === tokenRecord.userId && !record.usedAt) record.usedAt = now;
  });
  return true;
}
