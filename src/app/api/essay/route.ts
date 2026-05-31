import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { reviewEssay } from "@/lib/ai";
import { consumeAiUsage } from "@/lib/usage";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { themeId, themeText, body } = (await req.json()) as {
    themeId?: string;
    themeText: string;
    body: string;
  };

  if (!body || body.trim().length < 10) {
    return NextResponse.json(
      { error: "本文を10文字以上入力してください。" },
      { status: 400 }
    );
  }

  let theme = themeText;

  // お題マスタを使う場合は有料アクセスをサーバ側で検証
  if (themeId) {
    const themeRecord = await prisma.essayTheme.findUnique({
      where: { id: themeId },
    });
    if (!themeRecord) {
      return NextResponse.json({ error: "お題が見つかりません。" }, { status: 404 });
    }
    if (themeRecord.isPremium && user.plan !== "PREMIUM") {
      return NextResponse.json(
        { error: "このお題はプレミアム会員限定です。" },
        { status: 403 }
      );
    }
    theme = themeRecord.prompt;
  }

  if (!theme) {
    return NextResponse.json({ error: "お題を指定してください。" }, { status: 400 });
  }

  // AI利用上限のチェック・消費
  const usage = await consumeAiUsage(user.id, user.plan);
  if (!usage.allowed) {
    return NextResponse.json(
      {
        error: `本日のAI利用上限（${usage.limit}回）に達しました。明日以降、またはプランのアップグレードでご利用いただけます。`,
        limit: usage.limit,
      },
      { status: 429 }
    );
  }

  const { feedback, score } = await reviewEssay(theme, body);

  const record = await prisma.essay.create({
    data: {
      userId: user.id,
      themeId: themeId || null,
      themeText: theme,
      body,
      aiFeedback: feedback,
      score,
    },
  });

  return NextResponse.json({ id: record.id, feedback, score });
}
