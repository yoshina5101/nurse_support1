import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const user = await requireUser();

  const [selfCount, resumeCount, essayCount] = await Promise.all([
    prisma.selfAnalysis.count({ where: { userId: user.id } }),
    prisma.resume.count({ where: { userId: user.id } }),
    prisma.essay.count({ where: { userId: user.id } }),
  ]);

  const cards = [
    {
      href: "/self-analysis",
      title: "自己分析",
      desc: "設問に答えて、AIにあなたの強み・向いている職場を分析してもらいましょう。",
      count: `${selfCount} 件`,
      icon: "🔍",
    },
    {
      href: "/resume",
      title: "履歴書作成・添削",
      desc: "履歴書を作成し、採用担当者目線のAI添削を受けられます。",
      count: `${resumeCount} 件`,
      icon: "📄",
    },
    {
      href: "/essay",
      title: "小論文練習・添削",
      desc: "お題に沿って小論文を書き、AIの添削と点数で実力を確認しましょう。",
      count: `${essayCount} 件`,
      icon: "✍️",
    },
    {
      href: "/chat",
      title: "チャットルーム",
      desc: "同じ就活生や先輩と情報交換ができます。",
      count: "参加する",
      icon: "💬",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 p-6 text-white">
        <h2 className="text-xl font-bold">こんにちは、{user.name} さん 👋</h2>
        <p className="mt-1 text-sm text-brand-50">
          今日も就職活動を一歩進めましょう。気になるメニューから始めてください。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <span className="text-2xl" aria-hidden>
                {c.icon}
              </span>
              <span className="badge bg-brand-50 text-brand-700">{c.count}</span>
            </div>
            <h3 className="mt-3 font-semibold text-gray-800">{c.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{c.desc}</p>
          </Link>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        ※ AIによる添削・分析は参考情報です。最終的な判断はご自身で行ってください。
      </p>
    </div>
  );
}
