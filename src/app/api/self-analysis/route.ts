import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { summarizeSelfAnalysis } from "@/lib/ai";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { answers } = (await req.json()) as {
    answers: Record<string, string>;
  };
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const aiSummary = await summarizeSelfAnalysis(answers);

  const record = await prisma.selfAnalysis.create({
    data: { userId: user.id, answers, aiSummary },
  });

  return NextResponse.json({ id: record.id, aiSummary });
}
