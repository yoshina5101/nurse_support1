import { prisma } from "@/lib/db";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export type AdminStats = {
  totalStudents: number;
  premiumStudents: number;
  conversionRate: number; // 有料転換率(%)
  newUsers7d: number;
  newUsers30d: number;
  openReports: number;
  organizations: number;
  orgMembers: number;
  // AI利用（直近7日、日別）
  aiDaily: { date: string; count: number }[];
  aiTotal7d: number;
  // コンテンツ規模
  essayThemes: number;
  interviewQuestions: number;
  // 概算MRR（月額換算の売上）
  estimatedMrr: number;
};

export async function getAdminStats(premiumPriceJpy: number): Promise<AdminStats> {
  const [
    totalStudents,
    premiumStudents,
    newUsers7d,
    newUsers30d,
    openReports,
    organizations,
    orgMembers,
    aiRows,
    essayThemes,
    interviewQuestions,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "STUDENT", plan: "PREMIUM" } }),
    prisma.user.count({
      where: { role: "STUDENT", createdAt: { gte: daysAgo(7) } },
    }),
    prisma.user.count({
      where: { role: "STUDENT", createdAt: { gte: daysAgo(30) } },
    }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.organization.count(),
    prisma.user.count({ where: { organizationId: { not: null } } }),
    // 直近7日のAI利用（AiUsage.date は YYYY-MM-DD 文字列）
    prisma.aiUsage.findMany({
      where: { date: { gte: daysAgo(6).toISOString().slice(0, 10) } },
      select: { date: true, count: true },
    }),
    prisma.essayTheme.count(),
    prisma.interviewQuestion.count(),
  ]);

  // 日別に合算
  const map = new Map<string, number>();
  for (const r of aiRows) {
    map.set(r.date, (map.get(r.date) ?? 0) + r.count);
  }
  const aiDaily: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const key = daysAgo(i).toISOString().slice(0, 10);
    aiDaily.push({ date: key.slice(5), count: map.get(key) ?? 0 });
  }
  const aiTotal7d = aiDaily.reduce((s, d) => s + d.count, 0);

  const conversionRate =
    totalStudents > 0
      ? Math.round((premiumStudents / totalStudents) * 1000) / 10
      : 0;

  return {
    totalStudents,
    premiumStudents,
    conversionRate,
    newUsers7d,
    newUsers30d,
    openReports,
    organizations,
    orgMembers,
    aiDaily,
    aiTotal7d,
    essayThemes,
    interviewQuestions,
    estimatedMrr: premiumStudents * premiumPriceJpy,
  };
}
