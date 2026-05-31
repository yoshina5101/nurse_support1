import { prisma } from "@/lib/db";
import {
  createEssayTheme,
  updateEssayTheme,
  deleteEssayTheme,
} from "@/app/(admin)/actions";

export default async function AdminEssayThemesPage() {
  const themes = await prisma.essayTheme.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { essays: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">小論文お題管理</h2>
        <p className="mt-1 text-sm text-gray-500">
          小論文のお題の追加・編集・削除と、無料／有料の切り替えができます。
        </p>
      </div>

      <details className="card">
        <summary className="cursor-pointer font-medium text-brand-700">
          ＋ 新しいお題を追加
        </summary>
        <form action={createEssayTheme} className="mt-4 space-y-3">
          <input name="title" placeholder="お題タイトル" required className="input" />
          <textarea
            name="prompt"
            placeholder="設問文（例：あなたが目指す理想の看護師像について800字程度で述べなさい）"
            required
            className="input min-h-[100px]"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="isPremium" /> 有料お題にする
          </label>
          <button className="btn-primary">追加する</button>
        </form>
      </details>

      <div className="space-y-3">
        {themes.map((t) => (
          <div key={t.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`badge ${
                      t.isPremium
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {t.isPremium ? "有料" : "無料"}
                  </span>
                  <span className="text-xs text-gray-400">
                    提出 {t._count.essays} 件
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-gray-800">{t.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                  {t.prompt}
                </p>
              </div>
              <form action={deleteEssayTheme} className="shrink-0">
                <input type="hidden" name="id" value={t.id} />
                <button className="text-xs text-red-600 hover:underline">
                  削除
                </button>
              </form>
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-brand-600">
                編集する
              </summary>
              <form action={updateEssayTheme} className="mt-3 space-y-3">
                <input type="hidden" name="id" value={t.id} />
                <input
                  name="title"
                  defaultValue={t.title}
                  required
                  className="input"
                />
                <textarea
                  name="prompt"
                  defaultValue={t.prompt}
                  required
                  className="input min-h-[100px]"
                />
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    name="isPremium"
                    defaultChecked={t.isPremium}
                  />{" "}
                  有料お題にする
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
