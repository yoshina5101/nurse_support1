"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createToken } from "@/lib/tokens";
import { sendMail } from "@/lib/email";
import { getBaseUrl } from "@/lib/appUrl";

// メール確認リンクを発行して送信（SMTP未設定時はログ出力）。
// 戻り値の devLink は、メール未設定時に画面へ表示するためのフォールバック。
export async function issueEmailVerification(
  userId: string,
  email: string
): Promise<{ sent: boolean; devLink?: string }> {
  const token = await createToken(userId, "EMAIL_VERIFY");
  const base = await getBaseUrl();
  const link = `${base}/verify-email?token=${token}`;
  const sent = await sendMail({
    to: email,
    subject: "【あかり】メールアドレスの確認",
    text:
      "あかりにご登録ありがとうございます。\n\n" +
      "以下のリンクをクリックして、メールアドレスの確認を完了してください（24時間有効）。\n\n" +
      `${link}\n\n` +
      "心当たりがない場合は、このメールを破棄してください。",
  });
  return sent ? { sent: true } : { sent: false, devLink: link };
}

// パスワードリセットを要求（存在しないメールでも結果は同じにして列挙を防ぐ）。
export async function requestPasswordReset(
  email: string
): Promise<{ devLink?: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return {};

  const token = await createToken(user.id, "PASSWORD_RESET");
  const base = await getBaseUrl();
  const link = `${base}/reset-password?token=${token}`;
  const sent = await sendMail({
    to: email,
    subject: "【あかり】パスワードの再設定",
    text:
      "パスワード再設定のリクエストを受け付けました。\n\n" +
      "以下のリンクから新しいパスワードを設定してください（1時間有効）。\n\n" +
      `${link}\n\n` +
      "心当たりがない場合は、このメールを破棄してください。",
  });
  return sent ? {} : { devLink: link };
}

// パスワードを実際に更新する。
export async function updatePassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
