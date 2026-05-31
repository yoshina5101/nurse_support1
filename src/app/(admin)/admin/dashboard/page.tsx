import { getAdminStats } from "@/lib/adminStats";
import { getPremiumPriceJpy } from "@/lib/settings";

export default async function AdminDashboardPage() {
  const price = await getPremiumPriceJpy();
  const s = await getAdminStats(price);

  const kpis = [
    { label: "学生ユーザー", value: s.totalStudents, unit: "人", icon: "👥" },
    { label: "プレミアム会員", value: s.premiumStudents, unit: "人", icon: "⭐" },
    {
      label: "有料転換率",
      value: s.conversionRate,
      unit: "%",
      icon: "📈",
    },
    {
      label: "推定MRR",
      value: `¥${s.estimatedMrr.toLocaleString()}`,
      unit: "",
      icon: "💰",
    },
    { label: "新規(7日)", value: s.newUsers7d, unit: "人", icon: "🆕" },
    { label: "新規(30日)", value: s.newUsers30d, unit: "人", icon: "🗓️" },
    { label: "未対応の通報", value: s.openReports, unit: "件", icon: "🚩" },
    {
      label: "組織契約",
      value: s.organizations,
      unit: `件 / ${s.orgMembers}人`,
      icon: "🏫",
    },
  ];

  const maxAi = Math.max(1, ...s.aiDaily.map((d) => d.count));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">ダッシュボード（KPI）</h2>
        <p className="mt-1 text-sm text-gray-500">
          ユーザー数・課金・利用状況のサマリです。
        </p>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card">
            <div className="text-xl">{k.icon}</div>
            <p className="mt-1 text-2xl font-bold text-gray-800">
              {k.value}
              <span className="ml-0.5 text-sm font-normal text-gray-500">
                {k.unit}
              </span>
            </p>
            <p className="text-xs text-gray-500">{k.label}</p>
          </div>
        ))}
      </div>

      {/* AI利用 直近7日（簡易バーチャート） */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800">AI利用（直近7日）</h3>
          <span className="text-sm text-gray-500">
            合計 {s.aiTotal7d} 回
          </span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-2" style={{ height: 140 }}>
          {s.aiDaily.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{d.count}</span>
              <div
                className="w-full rounded-t-md bg-brand-400 transition-all"
                style={{ height: `${(d.count / maxAi) * 100}px`, minHeight: 2 }}
                title={`${d.date}: ${d.count}回`}
              />
              <span className="text-[10px] text-gray-400">{d.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* コンテンツ規模 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h3 className="font-bold text-gray-800">小論文お題</h3>
          <p className="mt-1 text-2xl font-bold text-gray-800">{s.essayThemes}</p>
          <p className="text-xs text-gray-500">登録数</p>
        </div>
        <div className="card">
          <h3 className="font-bold text-gray-800">面接質問</h3>
          <p className="mt-1 text-2xl font-bold text-gray-800">
            {s.interviewQuestions}
          </p>
          <p className="text-xs text-gray-500">登録数</p>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        ※ 推定MRRは「プレミアム会員数 × 月額」の概算です。6ヶ月パックや日割りは
        含みません。
      </p>
    </div>
  );
}
