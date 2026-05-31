import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { EssayForm } from "@/components/EssayForm";
import { ScoreTrend } from "@/components/ScoreTrend";

export default async function EssayPage() {
  const user = await requireUser();

  const [themes, pastEssays, scored] = await Promise.all([
    prisma.essayTheme.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.essay.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // 点数推移グラフ用：得点済みを古い順に最大10件
    prisma.essay.findMany({
      where: { userId: user.id, score: { not: null } },
      orderBy: { createdAt: "asc" },
      take: 10,
      select: { score: true, createdAt: true },
    }),
  ]);

  const trendPoints = scored.map((e) => ({
    score: e.score as number,
    date: e.createdAt,
  }));

  const themeOptions = themes.map((t) => ({
    id: t.id,
    title: t.title,
    prompt: t.prompt,
    isPremium: t.isPremium,
    locked: t.isPremium && user.plan !== "PREMIUM",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">小論文練習・AI添削</h2>
        <p className="mt-1 text-sm text-gray-500">
          お題を選んで小論文を書き、AIの添削と点数で実力を確認しましょう。
        </p>
      </div>

      <EssayForm themes={themeOptions} />

      <ScoreTrend points={trendPoints} label="小論文 点数の推移" />

      {pastEssays.length > 0 && (
        <div className="card">
          <h3 className="mb-3 font-semibold text-gray-800">これまでの提出</h3>
          <ul className="divide-y divide-gray-100">
            {pastEssays.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2 text-sm">
                <span className="truncate text-gray-600">{e.themeText}</span>
                <span className="ml-3 shrink-0 text-gray-400">
                  {e.score !== null ? `${e.score}点` : "—"} ・{" "}
                  {new Date(e.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
