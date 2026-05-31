import { prisma } from "@/lib/db";
import {
  createInterviewQuestion,
  updateInterviewQuestion,
  deleteInterviewQuestion,
} from "@/app/(admin)/actions";

export default async function AdminInterviewQuestionsPage() {
  const questions = await prisma.interviewQuestion.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { sessions: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">面接質問管理</h2>
        <p className="mt-1 text-sm text-gray-500">
          面接練習の質問の追加・編集・削除と、無料／有料の切り替えができます。表示順は小さい数字が先になります。
        </p>
      </div>

      <details className="card">
        <summary className="cursor-pointer font-medium text-brand-700">
          ＋ 新しい質問を追加
        </summary>
        <form action={createInterviewQuestion} className="mt-4 space-y-3">
          <textarea
            name="text"
            placeholder="質問文（例：当院を志望した理由を教えてください）"
            required
            className="input min-h-[80px]"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="category"
              placeholder="カテゴリ（例：志望動機）"
              className="input"
            />
            <input
              name="order"
              type="number"
              placeholder="表示順（例：1）"
              className="input"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="isPremium" /> 有料質問にする
          </label>
          <button className="btn-primary">追加する</button>
        </form>
      </details>

      <div className="space-y-3">
        {questions.map((q) => (
          <div key={q.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="badge bg-gray-100 text-gray-600">
                    {q.category}
                  </span>
                  <span
                    className={`badge ${
                      q.isPremium
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {q.isPremium ? "有料" : "無料"}
                  </span>
                  <span className="text-xs text-gray-400">
                    順 {q.order}・練習 {q._count.sessions} 件
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-800">{q.text}</p>
              </div>
              <form action={deleteInterviewQuestion} className="shrink-0">
                <input type="hidden" name="id" value={q.id} />
                <button className="text-xs text-red-600 hover:underline">
                  削除
                </button>
              </form>
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-brand-600">
                編集する
              </summary>
              <form action={updateInterviewQuestion} className="mt-3 space-y-3">
                <input type="hidden" name="id" value={q.id} />
                <textarea
                  name="text"
                  defaultValue={q.text}
                  required
                  className="input min-h-[80px]"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="category"
                    defaultValue={q.category}
                    className="input"
                  />
                  <input
                    name="order"
                    type="number"
                    defaultValue={q.order}
                    className="input"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    name="isPremium"
                    defaultChecked={q.isPremium}
                  />{" "}
                  有料質問にする
                </label>
                <button className="btn-secondary text-sm">保存する</button>
              </form>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
