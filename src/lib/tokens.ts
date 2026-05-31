import crypto from "crypto";
import { prisma } from "@/lib/db";
import type { TokenType } from "@prisma/client";

const EXPIRY_MINUTES: Record<TokenType, number> = {
  EMAIL_VERIFY: 60 * 24, // 24時間
  PASSWORD_RESET: 60, // 1時間
};

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// 生トークン（URLに載せる）と、DB保存用のハッシュ済みレコードを作成する。
// 同じユーザー・種別の未使用トークンは無効化してから新規発行する。
export async function createToken(
  userId: string,
  type: TokenType
): Promise<string> {
  await prisma.verificationToken.updateMany({
    where: { userId, type, usedAt: null },
    data: { usedAt: new Date() },
  });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRY_MINUTES[type] * 60 * 1000);

  await prisma.verificationToken.create({
    data: { userId, type, tokenHash: hashToken(rawToken), expiresAt },
  });

  return rawToken;
}

// トークンを検証し、有効なら userId を返して使用済みにする。
export async function consumeToken(
  rawToken: string,
  type: TokenType
): Promise<{ ok: boolean; userId?: string; reason?: string }> {
  const record = await prisma.verificationToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });
  if (!record || record.type !== type) {
    return { ok: false, reason: "invalid" };
  }
  if (record.usedAt) {
    return { ok: false, reason: "used" };
  }
  if (record.expiresAt < new Date()) {
    return { ok: false, reason: "expired" };
  }
  await prisma.verificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });
  return { ok: true, userId: record.userId };
}
