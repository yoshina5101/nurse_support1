import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const user = await requireUser();

  const [selfCount, resumeCount, essayCount, interviewCount] = await Promise.all([
    prisma.selfAnalysis.count({ where: { userId: user.id } }),
    prisma.resume.count({ where: { userId: user.id } }),
    prisma.essay.count({ where: { userId: user.id } }),
    prisma.interviewSession.count({ where: { userId: user.id } }),
  ]);

  const cards = [
    {
      href: "/self-analysis",
      title: "自己分析",
      desc: "5問に答えて、AIに強みを抽出・深掘りしてもらいましょう。",
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
      href: "/interview",
      title: "面接練習・レビュー",
      desc: "質問に声で回答（録音→文字起こし）。AIが面接官目線でレビューします。",
      count: `${interviewCount} 件`,
      icon: "🎤",
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-7 text-white shadow-soft">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-accent-400/20" />
        <div className="relative">
          <h2 className="text-2xl font-bold">こんにちは、{user.name} さん 👋</h2>
          <p className="mt-1.5 text-sm text-brand-50">
            今日も就職活動を一歩進めましょう。気になるメニューから始めてください。
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="card group transition-all hover:-translate-y-1 hover:shadow-soft-lg"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl transition-colors group-hover:bg-brand-100">
                {c.icon}
              </span>
              <span className="badge bg-cream-100 text-brand-700">
                {c.count}
              </span>
            </div>
            <h3 className="mt-4 font-bold text-gray-800">{c.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              {c.desc}
            </p>
          </Link>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        ※ AIによる添削・分析は参考情報です。最終的な判断はご自身で行ってください。
      </p>
    </div>
  );
}
