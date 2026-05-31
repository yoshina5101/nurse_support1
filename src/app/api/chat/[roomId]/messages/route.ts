import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { checkMessage } from "@/lib/moderation";

async function checkAccess(roomId: string, userPlan: string) {
  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room) return { ok: false, status: 404, room: null };
  if (room.isPremium && userPlan !== "PREMIUM") {
    return { ok: false, status: 403, room };
  }
  return { ok: true, status: 200, room };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { roomId } = await params;
  const access = await checkAccess(roomId, user.plan);
  if (!access.ok) {
    return NextResponse.json({ error: "no access" }, { status: access.status });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      body: m.isDeleted ? "（このメッセージは削除されました）" : m.body,
      isDeleted: m.isDeleted,
      authorName: m.user.name,
      isMine: m.userId === user.id,
      createdAt: m.createdAt,
    })),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { roomId } = await params;
  const access = await checkAccess(roomId, user.plan);
  if (!access.ok) {
    return NextResponse.json({ error: "no access" }, { status: access.status });
  }

  const { body } = (await req.json()) as { body: string };
  if (!body || !body.trim()) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  // 誹謗中傷・不適切ワードのチェック（投稿前にブロック）
  const moderation = checkMessage(body);
  if (!moderation.ok) {
    return NextResponse.json(
      {
        error:
          "不適切な表現が含まれているため投稿できません。相手を思いやった言葉づかいでお願いします。",
        matched: moderation.matched,
      },
      { status: 422 }
    );
  }

  const message = await prisma.chatMessage.create({
    data: { roomId, userId: user.id, body: body.trim() },
  });

  return NextResponse.json({ id: message.id });
}
