import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { reviewInterview } from "@/lib/ai";
import { consumeAiUsage } from "@/lib/usage";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { questionId, questionText, answer } = (await req.json()) as {
    questionId?: string;
    questionText?: string;
    answer: string;
  };

  if (!answer || answer.trim().length < 10) {
    return NextResponse.json(
      { error: "回答を10文字以上入力（または録音）してください。" },
      { status: 400 }
    );
  }

  let question = questionText ?? "";

  // 質問マスタを使う場合は有料アクセスをサーバ側で検証
  if (questionId) {
    const record = await prisma.interviewQuestion.findUnique({
      where: { id: questionId },
    });
    if (!record) {
      return NextResponse.json(
        { error: "質問が見つかりません。" },
        { status: 404 }
      );
    }
    if (record.isPremium && user.plan !== "PREMIUM") {
      return NextResponse.json(
        { error: "この質問はプレミアム会員限定です。" },
        { status: 403 }
      );
    }
    question = record.text;
  }

  if (!question) {
    return NextResponse.json({ error: "質問を指定してください。" }, { status: 400 });
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

  const { feedback, score } = await reviewInterview(question, answer);

  const session = await prisma.interviewSession.create({
    data: {
      userId: user.id,
      questionId: questionId || null,
      questionText: question,
      answer,
      aiFeedback: feedback,
      score,
    },
  });

  return NextResponse.json({ id: session.id, feedback, score });
}
