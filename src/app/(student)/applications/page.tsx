import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_ORDER,
} from "@/lib/applicationStatus";
import { ApplicationCard } from "@/components/ApplicationCard";
import { AddApplicationForm } from "@/components/AddApplicationForm";
import { UpcomingSchedule } from "@/components/UpcomingSchedule";

export default async function ApplicationsPage() {
  const user = await requireUser();

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { tasks: { orderBy: { createdAt: "asc" } } },
  });

  // ステータス別の件数サマリ
  const counts = APPLICATION_STATUS_ORDER.map((s) => ({
    status: s,
    label: APPLICATION_STATUS[s].label,
    badge: APPLICATION_STATUS[s].badge,
    count: applications.filter((a) => a.status === s).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">応募先・選考管理</h2>
        <p className="mt-1 text-sm text-gray-500">
          気になる病院・施設の選考状況や、見学日・締切・提出物をまとめて管理できます。
        </p>
      </div>

      {/* ステータス別サマリ */}
      <div className="flex flex-wrap gap-2">
        {counts.map((c) => (
          <span
            key={c.status}
            className={`badge ${c.badge} ${c.count === 0 ? "opacity-50" : ""}`}
          >
            {c.label} {c.count}
          </span>
        ))}
      </div>

      {/* 直近の予定 */}
      <UpcomingSchedule applications={applications} />

      {/* 新規追加 */}
      <AddApplicationForm />

      {/* 一覧 */}
      {applications.length === 0 ? (
        <div className="card text-center text-sm text-gray-500">
          まだ応募先が登録されていません。気になる病院を追加して、就活の進捗を管理しましょう 🌱
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}
