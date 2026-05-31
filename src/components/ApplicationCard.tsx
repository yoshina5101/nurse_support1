import type { Application, ApplicationTask } from "@prisma/client";
import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_ORDER,
} from "@/lib/applicationStatus";
import {
  updateApplication,
  deleteApplication,
  setApplicationStatus,
  createTask,
  toggleTask,
  deleteTask,
} from "@/app/(student)/applications/actions";

type AppWithTasks = Application & { tasks: ApplicationTask[] };

function fmt(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

function fmtJa(d: Date | null): string | null {
  if (!d) return null;
  return new Date(d).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  });
}

export function ApplicationCard({ application: app }: { application: AppWithTasks }) {
  const st = APPLICATION_STATUS[app.status];
  const openTasks = app.tasks.filter((t) => !t.done).length;

  const dates = [
    { label: "見学", value: fmtJa(app.visitDate) },
    { label: "締切", value: fmtJa(app.deadline) },
    { label: "試験", value: fmtJa(app.examDate) },
  ].filter((d) => d.value);

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-gray-800">{app.hospitalName}</h3>
            <span className={`badge ${st.badge}`}>{st.label}</span>
          </div>
          {app.department && (
            <p className="mt-0.5 text-sm text-gray-500">{app.department}</p>
          )}
          {dates.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              {dates.map((d) => (
                <span key={d.label}>
                  {d.label}: <span className="text-gray-700">{d.value}</span>
                </span>
              ))}
            </div>
          )}
          {app.memo && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
              {app.memo}
            </p>
          )}
        </div>

        {/* 一覧から素早くステータス変更 */}
        <form action={setApplicationStatus} className="shrink-0">
          <input type="hidden" name="id" value={app.id} />
          <select
            name="status"
            defaultValue={app.status}
            className="input !py-1.5 text-xs"
          >
            {APPLICATION_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {APPLICATION_STATUS[s].label}
              </option>
            ))}
          </select>
          <button className="mt-1 w-full text-xs text-brand-600 hover:underline">
            変更
          </button>
        </form>
      </div>

      {/* タスク（提出物・準備） */}
      <div className="mt-4 rounded-xl bg-cream-50 p-3">
        <p className="mb-2 text-xs font-semibold text-gray-600">
          📋 やること {openTasks > 0 && `（残り${openTasks}）`}
        </p>
        {app.tasks.length > 0 && (
          <ul className="mb-2 space-y-1">
            {app.tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-2 text-sm">
                <form action={toggleTask}>
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      t.done
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-gray-300"
                    }`}
                    title={t.done ? "未完了に戻す" : "完了にする"}
                  >
                    {t.done && "✓"}
                  </button>
                </form>
                <span
                  className={
                    t.done ? "text-gray-400 line-through" : "text-gray-700"
                  }
                >
                  {t.title}
                </span>
                {t.dueDate && (
                  <span className="text-xs text-gray-400">
                    〜{fmtJa(t.dueDate)}
                  </span>
                )}
                <form action={deleteTask} className="ml-auto">
                  <input type="hidden" name="id" value={t.id} />
                  <button className="text-xs text-gray-300 hover:text-red-500">
                    ✕
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <form action={createTask} className="flex gap-2">
          <input type="hidden" name="applicationId" value={app.id} />
          <input
            name="title"
            placeholder="例：エントリーシート提出"
            className="input !py-1.5 text-sm"
          />
          <input type="date" name="dueDate" className="input !py-1.5 !w-auto text-sm" />
          <button className="btn-secondary !px-3 !py-1.5 text-xs">追加</button>
        </form>
      </div>

      {/* 詳細編集・削除 */}
      <details className="mt-3">
        <summary className="cursor-pointer text-sm text-brand-600">
          詳細を編集
        </summary>
        <form action={updateApplication} className="mt-3 space-y-3">
          <input type="hidden" name="id" value={app.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">病院・施設名</label>
              <input
                name="hospitalName"
                defaultValue={app.hospitalName}
                className="input"
              />
            </div>
            <div>
              <label className="label">希望部署・診療科</label>
              <input
                name="department"
                defaultValue={app.department}
                className="input"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">見学日</label>
              <input
                type="date"
                name="visitDate"
                defaultValue={fmt(app.visitDate)}
                className="input"
              />
            </div>
            <div>
              <label className="label">応募締切</label>
              <input
                type="date"
                name="deadline"
                defaultValue={fmt(app.deadline)}
                className="input"
              />
            </div>
            <div>
              <label className="label">試験・面接日</label>
              <input
                type="date"
                name="examDate"
                defaultValue={fmt(app.examDate)}
                className="input"
              />
            </div>
          </div>
          <input type="hidden" name="status" value={app.status} />
          <div>
            <label className="label">メモ</label>
            <textarea
              name="memo"
              defaultValue={app.memo}
              className="input min-h-[70px]"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary text-sm">保存する</button>
          </div>
        </form>
        <form action={deleteApplication} className="mt-2">
          <input type="hidden" name="id" value={app.id} />
          <button className="text-xs text-red-600 hover:underline">
            この応募先を削除
          </button>
        </form>
      </details>
    </div>
  );
}
