import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ChatRoomView } from "@/components/ChatRoomView";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const user = await requireUser();
  const { roomId } = await params;

  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room) notFound();
  if (room.isPremium && user.plan !== "PREMIUM") redirect("/chat");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/chat" className="text-sm text-brand-600 hover:underline">
            ← ルーム一覧へ
          </Link>
          <h2 className="mt-1 text-xl font-bold text-gray-800">{room.name}</h2>
        </div>
      </div>
      <ChatRoomView roomId={room.id} />
    </div>
  );
}
