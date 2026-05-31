import { prisma } from "@/lib/db";
import {
  createStudent,
  deleteUser,
  toggleSuspend,
  togglePlan,
} from "@/app/(admin)/actions";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { resumes: true, essays: true, selfAnalyses: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">ユーザー管理</h2>
        <p className="mt-1 text-sm text-gray-500">
          学生アカウントの登録・確認・停止・削除ができます。
        </p>
      </div>

      <details className="card">
        <summary className="cursor-pointer font-medium text-brand-700">
          ＋ 新しい学生アカウントを登録
        </summary>
        <form action={createStudent} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="name" placeholder="氏名" required className="input" />
          <input
            name="email"
            type="email"
            placeholder="メールアドレス"
            required
            className="input"
          />
          <input
            name="password"
            type="password"
            placeholder="初期パスワード（6文字以上）"
            minLength={6}
            required
            className="input"
          />
          <select name="plan" className="input">
            <option value="FREE">無料会員</option>
            <option value="PREMIUM">プレミアム会員</option>
          </select>
          <div className="sm:col-span-2">
            <button className="btn-primary">登録する</button>
          </div>
        </form>
      </details>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">氏名 / メール</th>
              <th className="px-4 py-3">役割</th>
              <th className="px-4 py-3">プラン</th>
              <th className="px-4 py-3">状態</th>
              <th className="px-4 py-3">活動</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{u.name}</div>
                  <div className="text-xs text-gray-400">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      u.role === "ADMIN"
                        ? "bg-brand-100 text-brand-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {u.role === "ADMIN" ? "管理者" : "学生"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      u.plan === "PREMIUM"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {u.plan === "PREMIUM" ? "プレミアム" : "無料"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      u.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.status === "ACTIVE" ? "有効" : "停止中"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  履歴書{u._count.resumes}・小論文{u._count.essays}・分析
                  {u._count.selfAnalyses}
                </td>
                <td className="px-4 py-3">
                  {u.role !== "ADMIN" ? (
                    <div className="flex justify-end gap-2">
                      <form action={togglePlan}>
                        <input type="hidden" name="id" value={u.id} />
                        <button className="text-xs text-amber-600 hover:underline">
                          プラン変更
                        </button>
                      </form>
                      <form action={toggleSuspend}>
                        <input type="hidden" name="id" value={u.id} />
                        <button className="text-xs text-gray-600 hover:underline">
                          {u.status === "ACTIVE" ? "停止" : "解除"}
                        </button>
                      </form>
                      <form action={deleteUser}>
                        <input type="hidden" name="id" value={u.id} />
                        <button className="text-xs text-red-600 hover:underline">
                          削除
                        </button>
                      </form>
                    </div>
                  ) : (
                    <span className="block text-right text-xs text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
