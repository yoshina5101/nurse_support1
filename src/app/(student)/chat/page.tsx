import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export default async function ChatListPage() {
  const user = await requireUser();

  const rooms = await prisma.chatRoom.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { messages: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">チャットルーム</h2>
        <p className="mt-1 text-sm text-gray-500">
          就活仲間や先輩と情報交換しましょう。マナーを守ってご利用ください。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rooms.map((room) => {
          const locked = room.isPremium && user.plan !== "PREMIUM";
          return (
            <div key={room.id} className="card">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-800">{room.name}</h3>
                {room.isPremium && (
                  <span className="badge bg-amber-100 text-amber-700">有料</span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">{room.description}</p>
              <p className="mt-2 text-xs text-gray-400">
                {room._count.messages} 件のメッセージ
              </p>
              <div className="mt-3">
                {locked ? (
                  <span className="text-sm text-amber-700">
                    🔒 プレミアム会員限定
                  </span>
                ) : (
                  <Link href={`/chat/${room.id}`} className="btn-primary">
                    入室する
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
