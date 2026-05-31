import { prisma } from "@/lib/db";
import { resolveReport, deleteMessage } from "@/app/(admin)/actions";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      reporter: { select: { name: true } },
      message: {
        include: {
          user: { select: { name: true } },
          room: { select: { name: true } },
        },
      },
    },
  });

  const open = reports.filter((r) => r.status === "OPEN");
  const closed = reports.filter((r) => r.status !== "OPEN");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">通報管理</h2>
        <p className="mt-1 text-sm text-gray-500">
          チャットルームで通報されたメッセージを確認し、対応できます。
        </p>
      </div>

      <section>
        <h3 className="mb-3 font-semibold text-gray-700">
          未対応の通報（{open.length}）
        </h3>
        {open.length === 0 ? (
          <p className="card text-sm text-gray-400">未対応の通報はありません。</p>
        ) : (
          <div className="space-y-3">
            {open.map((r) => (
              <div key={r.id} className="card space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span>ルーム: {r.message.room.name}</span>
                  <span>投稿者: {r.message.user.name}</span>
                  <span>通報者: {r.reporter.name}</span>
                  <span>{new Date(r.createdAt).toLocaleString("ja-JP")}</span>
                </div>
                <div
                  className={`rounded-lg bg-gray-50 p-3 text-sm ${
                    r.message.isDeleted ? "italic text-gray-400" : "text-gray-800"
                  }`}
                >
                  {r.message.isDeleted
                    ? "（削除済みのメッセージ）"
                    : r.message.body}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">通報理由:</span> {r.reason}
                </p>
                <div className="flex flex-wrap gap-2">
                  {!r.message.isDeleted && (
                    <form action={deleteMessage}>
                      <input type="hidden" name="messageId" value={r.message.id} />
                      <input type="hidden" name="reportId" value={r.id} />
                      <button className="btn-danger text-xs">
                        メッセージを削除
                      </button>
                    </form>
                  )}
                  <form action={resolveReport}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="action" value="resolve" />
                    <button className="btn-secondary text-xs">対応済みにする</button>
                  </form>
                  <form action={resolveReport}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="action" value="dismiss" />
                    <button className="btn text-xs text-gray-500 hover:bg-gray-100">
                      却下（問題なし）
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {closed.length > 0 && (
        <section>
          <h3 className="mb-3 font-semibold text-gray-700">
            対応済み（{closed.length}）
          </h3>
          <div className="space-y-2">
            {closed.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm"
              >
                <span className="truncate text-gray-500">
                  {r.message.isDeleted ? "（削除済み）" : r.message.body}
                </span>
                <span
                  className={`badge ml-3 shrink-0 ${
                    r.status === "RESOLVED"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {r.status === "RESOLVED" ? "対応済み" : "却下"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
