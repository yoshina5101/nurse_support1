import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getProgress } from "@/lib/progress";
import { UpcomingSchedule } from "@/components/UpcomingSchedule";

export default async function DashboardPage() {
  const user = await requireUser();

  const { steps, doneCount, percent, next } = await getProgress(user.id);

  // 応募状況のサマリと直近予定
  const [applications, latestEssay] = await Promise.all([
    prisma.application.findMany({ where: { userId: user.id } }),
    prisma.essay.findFirst({
      where: { userId: user.id, score: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { score: true },
    }),
  ]);

  const offerCount = applications.filter((a) => a.status === "OFFER").length;
  const activeCount = applications.filter((a) =>
    ["APPLIED", "SCREENING", "INTERVIEW"].includes(a.status)
  ).length;

  const summary = [
    { label: "応募先", value: String(applications.length), unit: "件", icon: "🏥" },
    { label: "選考中", value: String(activeCount), unit: "件", icon: "📨" },
    { label: "内定", value: String(offerCount), unit: "件", icon: "🎓" },
    {
      label: "小論文 最高点",
      value: latestEssay?.score != null ? String(latestEssay.score) : "—",
      unit: latestEssay?.score != null ? "点" : "",
      icon: "✍️",
    },
  ];

  return (
    <div className="space-y-6">
      {/* あいさつ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-7 text-white shadow-soft">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-accent-400/20" />
        <div className="relative">
          <h2 className="text-2xl font-bold">こんにちは、{user.name} さん 👋</h2>
          <p className="mt-1.5 text-sm text-brand-50">
            今日も就職活動を一歩進めましょう。
          </p>
        </div>
      </div>

      {/* 進捗バー */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800">就活の進捗</h3>
          <span className="text-sm font-semibold text-brand-600">
            {doneCount} / {steps.length} ステップ（{percent}%）
          </span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-cream-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {steps.map((s) => (
            <Link
              key={s.key}
              href={s.href}
              className="flex flex-col items-center gap-1 text-center"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition ${
                  s.done
                    ? "bg-brand-100 ring-2 ring-brand-400"
                    : "bg-cream-100 opacity-70 hover:opacity-100"
                }`}
              >
                {s.done ? "✓" : s.icon}
              </span>
              <span className="text-[11px] leading-tight text-gray-600">
                {s.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 次の一歩 */}
      {next ? (
        <Link
          href={next.href}
          className="card group flex items-center gap-4 border-accent-200 bg-accent-50/40 transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-2xl">
            {next.icon}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-accent-600">
              次におすすめのステップ
            </p>
            <p className="font-bold text-gray-800">{next.label}</p>
            <p className="mt-0.5 text-sm text-gray-600">{next.hint}</p>
          </div>
          <span className="ml-auto shrink-0 text-accent-500">→</span>
        </Link>
      ) : (
        <div className="card border-brand-200 bg-brand-50/50 text-center">
          <p className="font-bold text-brand-700">
            🎉 すべてのステップに取り組みました！
          </p>
          <p className="mt-1 text-sm text-gray-600">
            この調子で、応募先の選考を進めていきましょう。
          </p>
        </div>
      )}

      {/* 数値サマリ */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="card">
            <div className="text-xl">{s.icon}</div>
            <p className="mt-1 text-2xl font-bold text-gray-800">
              {s.value}
              <span className="ml-0.5 text-sm font-normal text-gray-500">
                {s.unit}
              </span>
            </p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 直近の予定（応募先の日程） */}
      <UpcomingSchedule applications={applications} />

      {/* 機能ショートカット */}
      <div>
        <h3 className="mb-3 font-bold text-gray-800">メニュー</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <Link
              key={s.key}
              href={s.href}
              className="card group flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-xl transition-colors group-hover:bg-brand-100">
                {s.icon}
              </span>
              <div>
                <p className="font-semibold text-gray-800">{s.label}</p>
                <p className="text-xs text-gray-500">{s.count} 件</p>
              </div>
            </Link>
          ))}
          <Link
            href="/chat"
            className="card group flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-xl transition-colors group-hover:bg-brand-100">
              💬
            </span>
            <div>
              <p className="font-semibold text-gray-800">チャット</p>
              <p className="text-xs text-gray-500">仲間と相談</p>
            </div>
          </Link>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        ※ AIによる添削・分析は参考情報です。最終的な判断はご自身で行ってください。
      </p>
    </div>
  );
}
