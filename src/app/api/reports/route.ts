import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { messageId, reason } = (await req.json()) as {
    messageId: string;
    reason: string;
  };

  if (!messageId) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
  });
  if (!message) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await prisma.report.create({
    data: {
      messageId,
      reporterId: user.id,
      reason: reason?.trim() || "不適切な内容",
    },
  });

  return NextResponse.json({ ok: true });
}
