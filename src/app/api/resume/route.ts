import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { reviewResume } from "@/lib/ai";
import { consumeAiUsage } from "@/lib/usage";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id, title, content, review } = (await req.json()) as {
    id?: string;
    title: string;
    content: Record<string, string>;
    review?: boolean;
  };

  if (!content || typeof content !== "object") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  let aiFeedback: string | undefined;
  if (review) {
    // AI利用上限のチェック・消費（添削時のみ）
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
    aiFeedback = await reviewResume(content);
  }

  let record;
  if (id) {
    // 自分の履歴書のみ更新可能
    const existing = await prisma.resume.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    record = await prisma.resume.update({
      where: { id },
      data: {
        title: title || existing.title,
        content,
        ...(aiFeedback !== undefined ? { aiFeedback } : {}),
      },
    });
  } else {
    record = await prisma.resume.create({
      data: {
        userId: user.id,
        title: title || "私の履歴書",
        content,
        aiFeedback,
      },
    });
  }

  return NextResponse.json({
    id: record.id,
    aiFeedback: record.aiFeedback,
  });
}
