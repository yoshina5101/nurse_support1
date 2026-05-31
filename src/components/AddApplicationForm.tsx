import { createApplication } from "@/app/(student)/applications/actions";
import { APPLICATION_STATUS_ORDER, APPLICATION_STATUS } from "@/lib/applicationStatus";

export function AddApplicationForm() {
  return (
    <details className="card">
      <summary className="cursor-pointer font-semibold text-brand-700">
        ＋ 応募先を追加する
      </summary>
      <form action={createApplication} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">病院・施設名 *</label>
            <input
              name="hospitalName"
              required
              className="input"
              placeholder="例：〇〇総合病院"
            />
          </div>
          <div>
            <label className="label">希望部署・診療科</label>
            <input
              name="department"
              className="input"
              placeholder="例：救急・ICU"
            />
          </div>
        </div>

        <div>
          <label className="label">選考ステータス</label>
          <select name="status" className="input">
            {APPLICATION_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {APPLICATION_STATUS[s].label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label">見学日</label>
            <input type="date" name="visitDate" className="input" />
          </div>
          <div>
            <label className="label">応募締切</label>
            <input type="date" name="deadline" className="input" />
          </div>
          <div>
            <label className="label">試験・面接日</label>
            <input type="date" name="examDate" className="input" />
          </div>
        </div>

        <div>
          <label className="label">メモ</label>
          <textarea
            name="memo"
            className="input min-h-[70px]"
            placeholder="教育体制・通勤時間・気になる点など"
          />
        </div>

        <button className="btn-primary">追加する</button>
      </form>
    </details>
  );
}
