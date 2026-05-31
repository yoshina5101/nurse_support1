import type { Application } from "@prisma/client";

type Item = {
  date: Date;
  label: string;
  hospital: string;
  kind: string;
};

// 直近2週間の予定（見学・締切・試験）を集めて日付順に表示する。
export function UpcomingSchedule({
  applications,
}: {
  applications: Application[];
}) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in2weeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

  const items: Item[] = [];
  for (const a of applications) {
    const add = (d: Date | null, kind: string) => {
      if (!d) return;
      const dd = new Date(d);
      if (dd >= today && dd <= in2weeks) {
        items.push({ date: dd, label: kind, hospital: a.hospitalName, kind });
      }
    };
    add(a.visitDate, "見学");
    add(a.deadline, "締切");
    add(a.examDate, "試験・面接");
  }

  if (items.length === 0) return null;

  items.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="card border-accent-200 bg-accent-50/40">
      <h3 className="mb-3 font-bold text-gray-800">⏰ 直近2週間の予定</h3>
      <ul className="space-y-2">
        {items.map((it, i) => {
          const days = Math.round(
            (it.date.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
          );
          const soon = days <= 3;
          return (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span
                className={`badge ${
                  soon ? "bg-accent-500 text-white" : "bg-white text-gray-600"
                }`}
              >
                {it.date.toLocaleDateString("ja-JP", {
                  month: "numeric",
                  day: "numeric",
                })}
              </span>
              <span className="text-gray-700">
                {it.hospital}・{it.label}
              </span>
              <span
                className={`ml-auto text-xs ${
                  soon ? "font-semibold text-accent-600" : "text-gray-400"
                }`}
              >
                {days === 0 ? "今日" : `あと${days}日`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
