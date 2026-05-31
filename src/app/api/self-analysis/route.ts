import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { summarizeSelfAnalysis } from "@/lib/ai";
import { consumeAiUsage } from "@/lib/usage";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { answers } = (await req.json()) as {
    answers: Record<string, string>;
  };
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
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

  const aiSummary = await summarizeSelfAnalysis(answers);

  const record = await prisma.selfAnalysis.create({
    data: { userId: user.id, answers, aiSummary },
  });

  return NextResponse.json({ id: record.id, aiSummary });
}
