import { prisma } from "@/lib/db";
import {
  createOrganization,
  extendOrganization,
  deleteOrganization,
  addMemberByEmail,
  removeMember,
} from "@/app/(admin)/actions";
import { EmptyState } from "@/components/EmptyState";

export default async function AdminOrganizationsPage() {
  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      members: { select: { id: true, name: true, email: true } },
    },
  });

  const now = Date.now();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">組織契約（B2B）</h2>
        <p className="mt-1 text-sm text-gray-500">
          学校・病院などの組織にまとめてプレミアムを付与できます。所属メンバーは
          契約期間中、自動的にプレミアム機能を利用できます。
        </p>
      </div>

      <details className="card">
        <summary className="cursor-pointer font-semibold text-brand-700">
          ＋ 新しい組織を追加
        </summary>
        <form action={createOrganization} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="name" placeholder="組織名（例：〇〇看護大学）" required className="input" />
            <select name="kind" className="input">
              <option value="学校">学校</option>
              <option value="病院">病院</option>
              <option value="その他">その他</option>
            </select>
            <input
              name="seats"
              type="number"
              min={0}
              placeholder="契約シート数（0=無制限）"
              className="input"
            />
            <input
              name="months"
              type="number"
              min={0}
              placeholder="契約月数（例：12）"
              className="input"
            />
            <input
              name="contactEmail"
              type="email"
              placeholder="担当者メール"
              className="input sm:col-span-2"
            />
          </div>
          <textarea name="note" placeholder="メモ" className="input min-h-[60px]" />
          <button className="btn-primary">追加する</button>
        </form>
      </details>

      {orgs.length === 0 ? (
        <EmptyState
          icon="🏫"
          title="まだ組織契約がありません"
          description="学校や病院との一括契約をここで管理できます。上のフォームから追加してみましょう。"
        />
      ) : (
        <div className="space-y-4">
          {orgs.map((o) => {
            const active = o.premiumUntil && o.premiumUntil.getTime() > now;
            const overSeats = o.seats > 0 && o.members.length > o.seats;
            return (
              <div key={o.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800">{o.name}</h3>
                      <span className="badge bg-gray-100 text-gray-600">
                        {o.kind}
                      </span>
                      <span
                        className={`badge ${
                          active
                            ? "bg-brand-100 text-brand-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {active ? "契約中" : "契約なし/期限切れ"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {o.premiumUntil
                        ? `有効期限：${o.premiumUntil.toLocaleDateString("ja-JP")}`
                        : "有効期限：未設定"}
                      {" ・ "}
                      メンバー {o.members.length}
                      {o.seats > 0 ? ` / ${o.seats}` : "（無制限）"}
                      {overSeats && (
                        <span className="text-red-500">（シート超過）</span>
                      )}
                    </p>
                    {o.contactEmail && (
                      <p className="text-xs text-gray-400">{o.contactEmail}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <form action={extendOrganization} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={o.id} />
                      <input
                        name="months"
                        type="number"
                        min={1}
                        defaultValue={12}
                        className="input !w-20 !py-1.5 text-sm"
                      />
                      <button className="btn-secondary !px-3 !py-1.5 text-xs">
                        ヶ月延長
                      </button>
                    </form>
                  </div>
                </div>

                {/* メンバー管理 */}
                <div className="mt-4 rounded-xl bg-cream-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-gray-600">
                    メンバー
                  </p>
                  {o.members.length > 0 && (
                    <ul className="mb-3 divide-y divide-gray-100">
                      {o.members.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between py-1.5 text-sm"
                        >
                          <span className="text-gray-700">
                            {m.name}{" "}
                            <span className="text-xs text-gray-400">
                              {m.email}
                            </span>
                          </span>
                          <form action={removeMember}>
                            <input type="hidden" name="userId" value={m.id} />
                            <button className="text-xs text-red-600 hover:underline">
                              外す
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}
                  <form action={addMemberByEmail} className="flex gap-2">
                    <input type="hidden" name="organizationId" value={o.id} />
                    <input
                      name="email"
                      type="email"
                      placeholder="追加する学生のメールアドレス"
                      className="input !py-1.5 text-sm"
                    />
                    <button className="btn-secondary !px-3 !py-1.5 text-xs">
                      追加
                    </button>
                  </form>
                </div>

                <form action={deleteOrganization} className="mt-3">
                  <input type="hidden" name="id" value={o.id} />
                  <button className="text-xs text-red-600 hover:underline">
                    この組織を削除
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
