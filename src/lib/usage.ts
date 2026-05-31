import { prisma } from "@/lib/db";
import { getAiDailyLimit } from "@/lib/settings";

// 日本時間(JST)での YYYY-MM-DD を返す。
function todayJST(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

export type UsageResult = {
  allowed: boolean;
  used: number;
  limit: number; // -1 は無制限
  remaining: number; // -1 は無制限
};

// 現在の利用状況を確認（消費はしない）。
export async function checkAiUsage(
  userId: string,
  plan: "FREE" | "PREMIUM"
): Promise<UsageResult> {
  const limit = await getAiDailyLimit(plan);
  if (limit < 0) {
    return { allowed: true, used: 0, limit: -1, remaining: -1 };
  }
  const date = todayJST();
  const row = await prisma.aiUsage.findUnique({
    where: { userId_date: { userId, date } },
  });
  const used = row?.count ?? 0;
  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

// AI機能を1回消費する。上限到達時は allowed:false を返し、カウントしない。
export async function consumeAiUsage(
  userId: string,
  plan: "FREE" | "PREMIUM"
): Promise<UsageResult> {
  const check = await checkAiUsage(userId, plan);
  if (!check.allowed || check.limit < 0) {
    if (check.limit < 0) {
      // 無制限プランは記録だけ残す（任意）
      const date = todayJST();
      await prisma.aiUsage.upsert({
        where: { userId_date: { userId, date } },
        create: { userId, date, count: 1 },
        update: { count: { increment: 1 } },
      });
    }
    return check;
  }
  const date = todayJST();
  await prisma.aiUsage.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, count: 1 },
    update: { count: { increment: 1 } },
  });
  return {
    allowed: true,
    used: check.used + 1,
    limit: check.limit,
    remaining: Math.max(0, check.limit - check.used - 1),
  };
}
