import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { reviewEssay } from "@/lib/ai";

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
