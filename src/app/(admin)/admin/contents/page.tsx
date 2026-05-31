import { prisma } from "@/lib/db";
import {
  createContent,
  toggleContentPremium,
  deleteContent,
} from "@/app/(admin)/actions";

export default async function AdminContentsPage() {
  const contents = await prisma.content.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">コンテンツ管理</h2>
        <p className="mt-1 text-sm text-gray-500">
          お役立ち記事の追加・削除と、無料／有料の切り替えができます。
        </p>
      </div>

      <details className="card">
        <summary className="cursor-pointer font-medium text-brand-700">
          ＋ 新しいコンテンツを追加
        </summary>
        <form action={createContent} className="mt-4 space-y-3">
          <input name="title" placeholder="タイトル" required className="input" />
          <input
            name="category"
            placeholder="カテゴリ（例：面接対策）"
            className="input"
          />
          <textarea
            name="body"
            placeholder="本文"
            required
            className="input min-h-[120px]"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="isPremium" /> 有料コンテンツにする
          </label>
          <button className="btn-primary">追加する</button>
        </form>
      </details>

      <div className="space-y-3">
        {contents.map((c) => (
          <div key={c.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="badge bg-gray-100 text-gray-600">
                    {c.category}
                  </span>
                  <span
                    className={`badge ${
                      c.isPremium
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {c.isPremium ? "有料" : "無料"}
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-gray-800">{c.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{c.body}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <form action={toggleContentPremium}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-xs text-amber-600 hover:underline">
                    {c.isPremium ? "無料にする" : "有料にする"}
                  </button>
                </form>
                <form action={deleteContent}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-xs text-red-600 hover:underline">
                    削除
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
