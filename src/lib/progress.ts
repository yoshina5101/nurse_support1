import { prisma } from "@/lib/db";

export type StepKey =
  | "selfAnalysis"
  | "resume"
  | "essay"
  | "interview"
  | "application";

export type ProgressStep = {
  key: StepKey;
  label: string;
  href: string;
  icon: string;
  done: boolean;
  count: number;
  hint: string;
};

// 就活の進捗（各ステップの達成状況）を集計する。
export async function getProgress(userId: string): Promise<{
  steps: ProgressStep[];
  doneCount: number;
  percent: number;
  next: ProgressStep | null;
}> {
  const [selfCount, resumeCount, essayCount, interviewCount, appCount] =
    await Promise.all([
      prisma.selfAnalysis.count({ where: { userId } }),
      prisma.resume.count({ where: { userId } }),
      prisma.essay.count({ where: { userId } }),
      prisma.interviewSession.count({ where: { userId } }),
      prisma.application.count({ where: { userId } }),
    ]);

  const steps: ProgressStep[] = [
    {
      key: "selfAnalysis",
      label: "自己分析",
      href: "/self-analysis",
      icon: "🔍",
      done: selfCount > 0,
      count: selfCount,
      hint: "まずは自分の強みを知ることから始めましょう。",
    },
    {
      key: "resume",
      label: "履歴書",
      href: "/resume",
      icon: "📄",
      done: resumeCount > 0,
      count: resumeCount,
      hint: "志望動機と自己PRを作って、AI添削を受けましょう。",
    },
    {
      key: "essay",
      label: "小論文",
      href: "/essay",
      icon: "✍️",
      done: essayCount > 0,
      count: essayCount,
      hint: "お題に挑戦して、論理的な文章力を磨きましょう。",
    },
    {
      key: "interview",
      label: "面接練習",
      href: "/interview",
      icon: "🎤",
      done: interviewCount > 0,
      count: interviewCount,
      hint: "声に出して練習し、本番への自信をつけましょう。",
    },
    {
      key: "application",
      label: "応募先管理",
      href: "/applications",
      icon: "🏥",
      done: appCount > 0,
      count: appCount,
      hint: "気になる病院を登録して、選考状況を管理しましょう。",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const percent = Math.round((doneCount / steps.length) * 100);
  const next = steps.find((s) => !s.done) ?? null;

  return { steps, doneCount, percent, next };
}
